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
      <div className="aspect-square max-w-md mx-auto bg-white/40 rounded-[28px] border border-border/60 flex items-center justify-center">
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
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 3D Room with enhanced container */}
      <div className="relative max-w-md mx-auto">
        <div
          className="relative rounded-[28px] overflow-hidden"
          style={{ boxShadow: '0 12px 50px hsla(30, 30%, 20%, 0.18), 0 2px 8px hsla(30, 30%, 20%, 0.08)' }}
        >
          <RoomScene
            furniture={furniture}
            isEditMode={isEditMode}
            selectedId={selectedId}
            onSelect={handleSelect}
            onMove={handleMove}
          />

          {/* Gradient fade at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to top, rgb(var(--background)), transparent)' }}
          />

          {/* En direct badge removed */}
        </div>
      </div>

      {/* Edit toolbar */}
      <div className="flex items-center justify-center gap-2">
        {!isEditMode ? (
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-white border border-[#E8E0D4] text-foreground/50 font-sans text-[12px] font-medium hover:bg-white hover:shadow-sm transition-all"
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
                  className="flex items-center gap-1 px-3 py-2 rounded-[14px] bg-white border border-[#E8E0D4] text-foreground/40 font-sans text-[11px] hover:shadow-sm transition-all"
                >
                  <RotateCw size={12} />
                  Tourner
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-3 py-2 rounded-[14px] bg-red/[0.08] border border-red/15 text-red/50 font-sans text-[11px] hover:bg-red/[0.15] transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-green/[0.1] border border-green/20 text-green/60 font-sans text-[12px] font-medium hover:bg-green/[0.2] transition-colors disabled:opacity-30"
            >
              <Save size={14} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </>
        )}
      </div>

      {/* Catalog (visible in edit mode) */}
      {isEditMode && (
        <div className="space-y-3">
          <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
            Ajouter
          </p>

          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-[10px] font-sans text-[10px] font-medium transition-colors ${
                  activeCategory === cat.key
                    ? 'bg-yellow/[0.12] border border-yellow/20 text-yellow/70'
                    : 'bg-white border border-[#E8E0D4] text-foreground/30 hover:text-foreground/45'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {filteredCatalog.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAddItem(item.id)}
                className="flex-shrink-0 w-20 h-24 rounded-[14px] bg-white border border-[#E8E0D4] flex flex-col items-center justify-center gap-1.5 hover:shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <Plus size={14} className="text-foreground/20" />
                <span className="font-sans text-[9px] text-foreground/35 text-center leading-tight px-1">{item.name}</span>
                {item.price > 0 && (
                  <span className="flex items-center gap-0.5 font-sans font-semibold text-[8px] text-yellow/50">
                    <Coins size={8} />
                    {item.price}
                  </span>
                )}
              </button>
            ))}
            {filteredCatalog.length === 0 && (
              <p className="font-sans text-[11px] text-foreground/20 py-4 px-2">Aucun objet dans cette categorie</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
