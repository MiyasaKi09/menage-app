'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Pencil, Save, Trash2, RotateCw, Plus, Coins } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { RoomFurnitureData } from './RoomScene'

const RoomScene = dynamic(
  () => import('./RoomScene').then(mod => ({ default: mod.RoomScene })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground/50 rounded-full animate-spin mx-auto" />
          <p className="font-sans text-[12px] text-foreground/25">Chargement de la chambre...</p>
        </div>
      </div>
    ),
  }
)

interface CatalogItem {
  id: string
  name: string
  category: string
  price: number
  is_default: boolean
}

interface QuartierTabProps {
  householdId?: string
  userId?: string
}

const CATEGORIES = [
  { key: 'meubles', label: 'Meubles' },
  { key: 'luminaire', label: 'Luminaire' },
  { key: 'fenetres', label: 'Fenetres' },
  { key: 'deco', label: 'Deco' },
  { key: 'sols-murs', label: 'Sols-Murs' },
]

export function QuartierTab({ householdId, userId }: QuartierTabProps) {
  const supabase = createClient()
  const router = useRouter()

  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [furniture, setFurniture] = useState<RoomFurnitureData[]>([])
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [activeCategory, setActiveCategory] = useState('meubles')
  const [saving, setSaving] = useState(false)

  // Fetch furniture + catalog
  useEffect(() => {
    if (!householdId || !userId) return

    const fetchData = async () => {
      // Fetch placed furniture
      const { data: placed } = await supabase
        .from('room_furniture')
        .select('id, catalog_id, position_x, position_y, position_z, rotation_y, scale')
        .eq('household_id', householdId)
        .eq('profile_id', userId)

      if (placed) {
        setFurniture(placed.map((f: any) => ({
          id: f.id,
          catalog_id: f.catalog_id,
          position_x: Number(f.position_x),
          position_y: Number(f.position_y),
          position_z: Number(f.position_z),
          rotation_y: Number(f.rotation_y),
          scale: Number(f.scale),
        })))
      }

      // Fetch catalog
      const { data: cat } = await supabase
        .from('furniture_catalog')
        .select('id, name, category, price, is_default')
        .order('price')

      if (cat) setCatalog(cat)
    }

    fetchData()
  }, [householdId, userId, supabase])

  // If no furniture loaded and we have defaults, seed with defaults
  useEffect(() => {
    if (furniture.length === 0 && catalog.length > 0 && householdId && userId) {
      const defaults = catalog.filter(c => c.is_default)
      if (defaults.length > 0) {
        // Default layout positions
        const defaultPositions: Record<string, [number, number, number]> = {
          'bed_default': [-0.6, 0, 0.4],
          'table_default': [1.0, 0, -0.8],
          'lamp_default': [1.0, 0.56, -0.8],
          'shelf_default': [-1.7, 1.8, -0.3],
          'ceiling_light': [0, 2.7, -0.2],
          'window_gothic': [0.3, 0.8, -1.73],
        }

        const seeded = defaults
          .filter(d => defaultPositions[d.id])
          .map(d => ({
            id: `default-${d.id}`,
            catalog_id: d.id,
            position_x: defaultPositions[d.id][0],
            position_y: defaultPositions[d.id][1],
            position_z: defaultPositions[d.id][2],
            rotation_y: 0,
            scale: 1,
          }))

        setFurniture(seeded)
      }
    }
  }, [furniture.length, catalog, householdId, userId])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id || null)
  }, [])

  const handleMove = useCallback((id: string, pos: [number, number, number]) => {
    setFurniture(prev => prev.map(f =>
      f.id === id ? { ...f, position_x: pos[0], position_y: pos[1], position_z: pos[2] } : f
    ))
  }, [])

  const handleRotate = () => {
    if (!selectedId) return
    setFurniture(prev => prev.map(f =>
      f.id === selectedId ? { ...f, rotation_y: f.rotation_y + Math.PI / 4 } : f
    ))
  }

  const handleDelete = () => {
    if (!selectedId) return
    setFurniture(prev => prev.filter(f => f.id !== selectedId))
    setSelectedId(null)
  }

  const handleAddItem = (catalogId: string) => {
    const newItem: RoomFurnitureData = {
      id: `new-${Date.now()}`,
      catalog_id: catalogId,
      position_x: 0,
      position_y: 0,
      position_z: 0,
      rotation_y: 0,
      scale: 1,
    }
    setFurniture(prev => [...prev, newItem])
    setSelectedId(newItem.id)
  }

  const handleSave = async () => {
    if (!householdId || !userId) return
    setSaving(true)

    // Delete all existing and re-insert
    await supabase
      .from('room_furniture')
      .delete()
      .eq('household_id', householdId)
      .eq('profile_id', userId)

    if (furniture.length > 0) {
      await supabase.from('room_furniture').insert(
        furniture.map(f => ({
          household_id: householdId,
          profile_id: userId,
          catalog_id: f.catalog_id,
          position_x: f.position_x,
          position_y: f.position_y,
          position_z: f.position_z,
          rotation_y: f.rotation_y,
          scale: f.scale,
        }))
      )
    }

    setSaving(false)
    setIsEditMode(false)
    router.refresh()
  }

  const filteredCatalog = catalog.filter(c => c.category === activeCategory)

  return (
    <>
      {/* Immersive fullscreen 3D scene — fixed behind everything */}
      <motion.div
        className="fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: 'linear-gradient(180deg, #f5e6c8 0%, #ede0c0 100%)' }}
      >
        <RoomScene
          furniture={furniture}
          isEditMode={isEditMode}
          selectedId={selectedId}
          onSelect={handleSelect}
          onMove={handleMove}
        />
      </motion.div>

      {/* Floating UI overlays */}
      <div className="relative z-10 pointer-events-none">
        {/* Edit toolbar — floats bottom of viewport */}
        <div className="fixed bottom-24 left-0 right-0 flex items-center justify-center gap-2 px-4 pointer-events-auto">
          {!isEditMode ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-[14px] font-sans text-[12px] font-medium transition-all shadow-lg"
              style={{
                background: 'rgba(255,245,230,0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(232,224,212,0.6)',
                color: 'hsl(30, 30%, 30%)',
              }}
            >
              <Pencil size={14} />
              Editer
            </button>
          ) : (
            <>
              {selectedId && (
                <>
                  <button
                    onClick={handleRotate}
                    className="flex items-center gap-1 px-3 py-2 rounded-[14px] font-sans text-[11px] shadow-lg"
                    style={{
                      background: 'rgba(255,245,230,0.75)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(232,224,212,0.6)',
                      color: 'hsl(30, 30%, 40%)',
                    }}
                  >
                    <RotateCw size={12} />
                    Tourner
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 px-3 py-2 rounded-[14px] font-sans text-[11px] shadow-lg"
                    style={{
                      background: 'rgba(240,200,200,0.7)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(200,120,120,0.4)',
                      color: 'hsl(0, 40%, 40%)',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[14px] font-sans text-[12px] font-medium shadow-lg disabled:opacity-30"
                style={{
                  background: 'rgba(200,230,200,0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(130,180,130,0.4)',
                  color: 'hsl(140, 30%, 30%)',
                }}
              >
                <Save size={14} />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </>
          )}
        </div>

        {/* Catalog panel — floats from bottom in edit mode */}
        {isEditMode && (
          <motion.div
            className="fixed bottom-36 left-0 right-0 px-4 pointer-events-auto"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="max-w-md mx-auto rounded-[20px] p-3 space-y-3"
              style={{
                background: 'rgba(255,245,230,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(232,224,212,0.6)',
                boxShadow: '0 8px 32px rgba(30,20,10,0.12)',
              }}
            >
              <p className="font-sans text-[11px] text-foreground/35 tracking-widest uppercase">
                Ajouter
              </p>

              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-[10px] font-sans text-[10px] font-medium transition-colors ${
                      activeCategory === cat.key
                        ? 'bg-yellow/[0.2] border border-yellow/30 text-yellow/80'
                        : 'bg-white/60 border border-[#E8E0D4] text-foreground/40 hover:text-foreground/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {filteredCatalog.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item.id)}
                    className="flex-shrink-0 w-20 h-24 rounded-[14px] bg-white/70 border border-[#E8E0D4] flex flex-col items-center justify-center gap-1.5 hover:bg-white transition-all"
                  >
                    <Plus size={14} className="text-foreground/30" />
                    <span className="font-sans text-[9px] text-foreground/50 text-center leading-tight px-1">{item.name}</span>
                    {item.price > 0 && (
                      <span className="flex items-center gap-0.5 font-sans font-semibold text-[8px] text-yellow/60">
                        <Coins size={8} />
                        {item.price}
                      </span>
                    )}
                  </button>
                ))}
                {filteredCatalog.length === 0 && (
                  <p className="font-sans text-[11px] text-foreground/30 py-4 px-2">Aucun objet</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
