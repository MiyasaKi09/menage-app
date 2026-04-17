'use client'

import { useState } from 'react'
import { Bell, Coins, Swords, BarChart3, X, Plus, Users, Moon, Sun, ShoppingBag, Shield, LogOut, Trash2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CLASS_EMOJIS, CLASS_IMAGES } from '@/lib/characters/types'

interface QuickAccessBarProps {
  userId: string
  totalPoints: number
  leaderboard: any[]
  households: Array<{ id: string; name: string; status: string; role: string }>
  shopCategories: any[]
  shopItems: any[]
  purchasedItems: any[]
  stats: {
    streak: number
    level: number
    tasksCompleted: number
    timesFirst: number
    timesSecond: number
    timesThird: number
    tasksByCategory: Array<{ category: string; emoji: string; count: number }>
    favoriteCharacter: { name: string; class: string; timesReceived: number } | null
    annualCard: { title: string; subtitle: string } | null
  }
}

type OverlayType = 'fief' | 'negoce' | 'tournoi' | 'stats' | null

export function QuickAccessBar({
  userId,
  totalPoints,
  leaderboard,
  households,
  shopCategories,
  shopItems,
  purchasedItems,
  stats,
}: QuickAccessBarProps) {
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null)

  const buttons = [
    { id: 'fief' as const,    icon: Bell,     label: 'Fief',    color: '--yellow' },
    { id: 'negoce' as const,  icon: Coins,    label: 'Négoce',  color: '--green'  },
    { id: 'tournoi' as const, icon: Swords,   label: 'Tournoi', color: '--red'    },
    { id: 'stats' as const,   icon: BarChart3, label: 'Stats',  color: '--blue'   },
  ]

  return (
    <>
      <div className="grid grid-cols-4 gap-2.5">
        {buttons.map((btn) => {
          const Icon = btn.icon
          const c = btn.color
          return (
            <button
              key={btn.id}
              onClick={() => setActiveOverlay(btn.id)}
              className="flex flex-col items-center gap-2 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: `linear-gradient(145deg, rgb(var(${c})/0.12), rgb(var(${c})/0.06))`,
                border: `1px solid rgb(var(${c})/0.2)`,
                boxShadow: `0 2px 12px rgb(var(${c})/0.08)`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `rgb(var(${c})/0.15)` }}
              >
                <Icon size={19} strokeWidth={1.6} style={{ color: `rgb(var(${c}))` }} />
              </div>
              <span
                className="font-sans text-[10px] font-semibold tracking-wide"
                style={{ color: `rgb(var(${c})/0.75)` }}
              >
                {btn.label}
              </span>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {activeOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveOverlay(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md max-h-[80vh] bg-card rounded-[22px] border border-border shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <h2 className="font-serif text-lg text-foreground font-semibold">
                  {activeOverlay === 'fief' && 'Fief'}
                  {activeOverlay === 'negoce' && 'Negoce'}
                  {activeOverlay === 'tournoi' && 'Tournoi'}
                  {activeOverlay === 'stats' && 'Statistiques'}
                </h2>
                <button
                  onClick={() => setActiveOverlay(null)}
                  className="p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                >
                  <X size={18} className="text-foreground/40" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 overflow-y-auto max-h-[65vh]">
                {activeOverlay === 'fief' && <FiefOverlayContent households={households} userId={userId} />}
                {activeOverlay === 'negoce' && (
                  <NegoceOverlayContent
                    totalPoints={totalPoints}
                    shopCategories={shopCategories}
                    shopItems={shopItems}
                    purchasedItems={purchasedItems}
                  />
                )}
                {activeOverlay === 'tournoi' && <TournoiOverlayContent leaderboard={leaderboard} />}
                {activeOverlay === 'stats' && <StatsOverlayContent stats={stats} />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── FIEF OVERLAY ──────────────────────────────────────────────────────────────

function FiefOverlayContent({ households, userId }: { households: Array<{ id: string; name: string; status: string; role: string }>; userId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [localHouseholds, setLocalHouseholds] = useState(households)
  const [confirmAction, setConfirmAction] = useState<{ type: 'leave' | 'delete'; householdId: string; name: string } | null>(null)

  const toggleStatus = async (householdId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'dormant' : 'active'
    await supabase
      .from('household_members')
      .update({ status: newStatus })
      .eq('household_id', householdId)

    setLocalHouseholds((prev) =>
      prev.map((h) => (h.id === householdId ? { ...h, status: newStatus } : h))
    )
  }

  const handleLeave = async (householdId: string) => {
    const { error } = await supabase
      .from('household_members')
      .delete()
      .eq('household_id', householdId)
      .eq('profile_id', userId)

    if (error) {
      console.error('Error leaving household:', error)
      return
    }

    setLocalHouseholds((prev) => prev.filter((h) => h.id !== householdId))
    setConfirmAction(null)
    router.refresh()
  }

  const handleDelete = async (householdId: string) => {
    const { error } = await supabase
      .from('households')
      .delete()
      .eq('id', householdId)

    if (error) {
      console.error('Error deleting household:', error)
      return
    }

    setLocalHouseholds((prev) => prev.filter((h) => h.id !== householdId))
    setConfirmAction(null)
    router.refresh()
  }

  const renderFiefCard = (h: typeof households[0]) => (
    <div key={h.id} className={`py-3 px-3 rounded-xl border ${h.status === 'active' ? 'bg-white/60 border-border/60' : 'bg-white/40 border-border/40'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-sans font-semibold text-[14px] ${h.status === 'active' ? 'text-foreground/70' : 'text-foreground/30'}`}>{h.name}</p>
          <p className={`font-sans text-[11px] ${h.status === 'active' ? 'text-foreground/25' : 'text-foreground/15'}`}>{h.role}</p>
        </div>
        <button
          onClick={() => toggleStatus(h.id, h.status)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-sans text-[10px] transition-colors ${
            h.status === 'active'
              ? 'bg-white/60 border border-border/60 text-foreground/30 hover:bg-white'
              : 'bg-yellow/[0.08] border border-yellow/20 text-yellow/60 hover:bg-yellow/[0.15]'
          }`}
        >
          {h.status === 'active' ? <Moon size={12} /> : <Sun size={12} />}
          {h.status === 'active' ? 'Dormant' : 'Activer'}
        </button>
      </div>
      {/* Quitter / Supprimer */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
        <button
          onClick={() => setConfirmAction({ type: 'leave', householdId: h.id, name: h.name })}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-red/40 font-sans text-[10px] hover:text-red/60 hover:bg-red/[0.05] transition-colors"
        >
          <LogOut size={10} />
          Quitter
        </button>
        {h.role === 'admin' && (
          <button
            onClick={() => setConfirmAction({ type: 'delete', householdId: h.id, name: h.name })}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-red/40 font-sans text-[10px] hover:text-red/60 hover:bg-red/[0.05] transition-colors"
          >
            <Trash2 size={10} />
            Supprimer
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="bg-red/[0.06] border border-red/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red/60" />
            <p className="font-sans font-semibold text-[13px] text-red/70">
              {confirmAction.type === 'delete' ? 'Supprimer' : 'Quitter'} &laquo;{confirmAction.name}&raquo; ?
            </p>
          </div>
          <p className="font-sans text-[12px] text-foreground/30">
            {confirmAction.type === 'delete'
              ? 'Cela supprimera le fief et toutes ses donnees pour tous les membres.'
              : 'Vous perdrez votre progression dans ce fief.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => confirmAction.type === 'delete' ? handleDelete(confirmAction.householdId) : handleLeave(confirmAction.householdId)}
              className="flex-1 py-2 rounded-lg bg-red/[0.15] border border-red/20 text-red/70 font-sans font-semibold text-[12px] hover:bg-red/[0.25] transition-colors"
            >
              Confirmer
            </button>
            <button
              onClick={() => setConfirmAction(null)}
              className="flex-1 py-2 rounded-lg bg-white/60 border border-border/60 text-foreground/40 font-sans font-semibold text-[12px] hover:bg-white transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Fiefs list */}
      {localHouseholds.length > 0 && (
        <div className="space-y-2">
          {localHouseholds.map(renderFiefCard)}
        </div>
      )}

      {/* Dots indicator */}
      {localHouseholds.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {localHouseholds.map((h) => (
            <div
              key={h.id}
              className={`w-2 h-2 rounded-full ${h.status === 'active' ? 'bg-green/40' : 'bg-foreground/15'}`}
            />
          ))}
        </div>
      )}

      {localHouseholds.length === 0 && (
        <p className="text-center font-sans text-[13px] text-foreground/30 py-4">Aucun fief</p>
      )}

      {/* Action buttons */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <button
          onClick={() => router.push('/household/setup')}
          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-white/60 border border-border/60 hover:bg-white/80 transition-colors"
        >
          <Plus size={16} className="text-foreground/30" />
          <span className="font-sans font-semibold text-[13px] text-foreground/45">Rejoindre</span>
        </button>
        <button
          onClick={() => router.push('/household/setup')}
          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-white/60 border border-border/60 hover:bg-white/80 transition-colors"
        >
          <Shield size={16} className="text-foreground/30" />
          <span className="font-sans font-semibold text-[13px] text-foreground/45">Nouveau fief</span>
        </button>
        <button className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-white/60 border border-border/60 hover:bg-white/80 transition-colors">
          <Users size={16} className="text-foreground/30" />
          <span className="font-sans font-semibold text-[13px] text-foreground/45">Mode accompagnateur</span>
          <span className="ml-auto font-sans text-[10px] text-foreground/15">Ajouter un enfant</span>
        </button>
      </div>
    </div>
  )
}

// ─── NEGOCE OVERLAY (BOUTIQUE) ─────────────────────────────────────────────────

function NegoceOverlayContent({
  totalPoints,
  shopCategories,
  shopItems,
  purchasedItems,
}: {
  totalPoints: number
  shopCategories: any[]
  shopItems: any[]
  purchasedItems: any[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const purchasedIds = new Set(purchasedItems.map((p: any) => p.item_id))

  const filteredItems = activeCategory
    ? shopItems.filter((item: any) => item.category_id === activeCategory)
    : shopItems

  const handlePurchase = async (item: any) => {
    if (totalPoints < item.price) return

    // Deduct points
    await supabase.rpc('deduct_points', { p_amount: item.price })

    // Add to purchased items
    await supabase.from('purchased_items').insert({
      item_id: item.id,
    })

    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Balance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins size={18} className="text-yellow/60" />
          <span className="font-serif text-xl text-yellow font-bold">{totalPoints}</span>
          <span className="font-sans text-[11px] text-foreground/25">pieces d&apos;or</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShoppingBag size={14} className="text-foreground/25" />
          <span className="font-sans text-[11px] text-foreground/25">{purchasedItems.length} objets</span>
        </div>
      </div>

      {/* Mes ressources summary */}
      <div className="bg-white/40 rounded-xl p-3 border border-border/40">
        <p className="font-sans text-[10px] text-foreground/20 tracking-widest uppercase mb-2">Mes ressources</p>
        <div className="flex flex-wrap gap-1.5">
          {shopCategories.slice(0, 4).map((cat: any) => {
            const count = purchasedItems.filter((p: any) => {
              const item = shopItems.find((i: any) => i.id === p.item_id)
              return item?.category_id === cat.id
            }).length
            return (
              <span key={cat.id} className="px-2 py-0.5 rounded bg-white/60 font-sans text-[10px] text-foreground/30">
                {cat.name}: {count}
              </span>
            )
          })}
        </div>
      </div>

      {/* Categories tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 px-2.5 py-1 rounded-lg font-sans text-[10px] transition-colors ${
            !activeCategory ? 'bg-yellow/[0.15] text-yellow/70 border border-yellow/20' : 'bg-white/60 text-foreground/30 border border-transparent'
          }`}
        >
          Tout
        </button>
        {shopCategories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-lg font-sans text-[10px] transition-colors ${
              activeCategory === cat.id ? 'bg-yellow/[0.15] text-yellow/70 border border-yellow/20' : 'bg-white/60 text-foreground/30 border border-transparent'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="space-y-2">
        {filteredItems.map((item: any) => {
          const owned = purchasedIds.has(item.id)
          const canAfford = totalPoints >= item.price
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 py-3 px-3 rounded-xl border transition-colors ${
                owned ? 'bg-green/[0.04] border-green/10' : 'bg-white/40 border-border/60'
              }`}
            >
              {/* Item preview */}
              <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0">
                <span className="text-sm opacity-40">
                  {item.item_type === 'furniture' ? '🪑' : item.item_type === 'lighting' ? '💡' : item.item_type === 'decor' ? '🖼️' : '📦'}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[13px] text-foreground/50 truncate">{item.name}</p>
                <p className="font-sans text-[11px] text-foreground/20">
                  {(item.shop_categories as any)?.name || ''}
                </p>
              </div>

              {/* Price / owned */}
              {owned ? (
                <span className="font-sans text-[10px] text-green/50 px-2 py-0.5 rounded bg-green/[0.1]">Possede</span>
              ) : (
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-sans font-semibold text-[12px] transition-colors ${
                    canAfford
                      ? 'bg-yellow/[0.1] border border-yellow/20 text-yellow/70 hover:bg-yellow/[0.2]'
                      : 'bg-white/40 border border-border/40 text-foreground/15 cursor-not-allowed'
                  }`}
                >
                  <Coins size={10} />
                  {item.price}
                </button>
              )}
            </div>
          )
        })}

        {filteredItems.length === 0 && (
          <p className="text-center font-sans text-[13px] text-foreground/30 py-6">
            Aucun objet disponible
          </p>
        )}
      </div>
    </div>
  )
}

// ─── TOURNOI OVERLAY ───────────────────────────────────────────────────────────

function TournoiOverlayContent({ leaderboard }: { leaderboard: any[] }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-3xl mb-1">⚔️</div>
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">Classement du fief</p>
      </div>
      <div className="space-y-1">
        {leaderboard.map((member, index) => {
          const medals = ['🥇', '🥈', '🥉']
          const displayName = (member.profiles as any)?.display_name || 'Joueur'
          return (
            <div
              key={member.profile_id}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                index < 3 ? 'bg-white/60' : ''
              }`}
            >
              <span className="w-6 text-center font-sans font-semibold text-[14px] text-foreground/40">
                {index < 3 ? medals[index] : `${index + 1}`}
              </span>
              {/* Blason icon */}
              <div className="w-6 h-6 rounded bg-white/80 flex items-center justify-center flex-shrink-0">
                <Shield size={12} className="text-foreground/20" />
              </div>
              <span className="flex-1 font-sans text-[14px] text-foreground/50">{displayName}</span>
              <span className="font-sans font-semibold text-[13px] text-yellow/60">
                {member.points_in_household || 0}
              </span>
            </div>
          )
        })}
        {leaderboard.length === 0 && (
          <p className="text-center font-sans text-[13px] text-foreground/30 py-8">
            Aucun membre dans le tournoi
          </p>
        )}
      </div>
    </div>
  )
}

// ─── STATISTIQUES OVERLAY ──────────────────────────────────────────────────────

function StatsOverlayContent({
  stats,
}: {
  stats: QuickAccessBarProps['stats']
}) {
  const maxCategoryCount = Math.max(...stats.tasksByCategory.map((t) => t.count), 1)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
          Mise a jour hebdomadaire
        </p>
      </div>

      {/* Times on podium */}
      <div className="space-y-2">
        <p className="font-sans text-[10px] text-foreground/20 tracking-widest uppercase">Podium</p>
        <div className="flex items-end justify-center gap-4">
          <div className="flex flex-col items-center">
            <span className="font-serif text-sm text-foreground/25 mb-1">{stats.timesSecond}x</span>
            <span className="font-serif text-xl text-foreground/30">2</span>
            <div className="w-14 h-10 bg-white/80 rounded-t-lg flex items-center justify-center">
              <span className="text-lg">🥈</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-sm text-yellow/60 mb-1">{stats.timesFirst}x</span>
            <span className="font-serif text-2xl text-yellow">1</span>
            <div className="w-14 h-16 bg-yellow/[0.1] rounded-t-lg flex items-center justify-center border border-yellow/20">
              <span className="text-xl">🥇</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-sm text-foreground/25 mb-1">{stats.timesThird}x</span>
            <span className="font-serif text-xl text-foreground/30">3</span>
            <div className="w-14 h-7 bg-white/80 rounded-t-lg flex items-center justify-center">
              <span className="text-lg">🥉</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks by category - bar chart */}
      <div className="space-y-2">
        <p className="font-sans text-[10px] text-foreground/20 tracking-widest uppercase">
          Corvees effectuees → type le plus fait
        </p>
        <div className="space-y-1.5">
          {stats.tasksByCategory.slice(0, 5).map((cat, index) => (
            <div key={cat.category} className="flex items-center gap-2">
              <span className="w-20 font-sans text-[11px] text-foreground/35 truncate">{cat.category}</span>
              <div className="flex-1 h-4 bg-white/40 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all ${index === 0 ? 'bg-yellow/30' : 'bg-white'}`}
                  style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                />
              </div>
              <span className="font-sans font-semibold text-[11px] text-foreground/30 w-6 text-right">{cat.count}</span>
            </div>
          ))}
        </div>
        {stats.tasksByCategory[0] && (
          <div className="flex items-center gap-2 mt-2 px-2 py-2 bg-yellow/[0.05] rounded-lg border border-yellow/10">
            <span className="font-sans text-[10px] text-yellow/50">→</span>
            <span className="font-sans text-[12px] text-yellow/50">
              Tache la plus realisee : {stats.tasksByCategory[0].category}
            </span>
          </div>
        )}
      </div>

      {/* Favorite character (guild annual) */}
      {stats.favoriteCharacter && (
        <div className="space-y-2">
          <p className="font-sans text-[10px] text-foreground/20 tracking-widest uppercase">
            Guilde annuelle
          </p>
          <div className="flex items-center gap-3 p-3 bg-white/40 rounded-xl border border-border/60">
            <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">
              <span className="text-lg">{CLASS_EMOJIS[stats.favoriteCharacter.class] || '🃏'}</span>
            </div>
            <div>
              <p className="font-sans font-semibold text-[13px] text-foreground/50">
                Personnage le plus attribue
              </p>
              <p className="font-sans text-[12px] text-foreground/35">
                {stats.favoriteCharacter.name} ({stats.favoriteCharacter.timesReceived}x)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Annual card */}
      {stats.annualCard && (
        <div className="space-y-2">
          <p className="font-sans text-[10px] text-foreground/20 tracking-widest uppercase">
            Carte annuelle
          </p>
          <div className="relative bg-gradient-to-br from-white/80 to-white/40 rounded-2xl border border-border p-5 text-center overflow-hidden">
            {/* Character image background */}
            {stats.favoriteCharacter && CLASS_IMAGES[stats.favoriteCharacter.class] && (
              <div className="absolute inset-0 opacity-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CLASS_IMAGES[stats.favoriteCharacter.class]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="relative">
              <p className="font-serif text-lg text-foreground/70 font-semibold">
                {stats.annualCard.title}
              </p>
              <p className="font-sans text-[12px] text-foreground/30 mt-1">
                {stats.annualCard.subtitle}
              </p>
              <div className="mt-3 inline-flex px-3 py-1 rounded-lg bg-white/60 border border-border/60">
                <span className="font-sans text-[10px] text-foreground/20">→ ordre chronologique</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
