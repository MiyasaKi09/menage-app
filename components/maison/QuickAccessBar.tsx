'use client'

import { useState } from 'react'
import { Bell, Coins, Swords, BarChart3, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuickAccessBarProps {
  totalPoints: number
  leaderboard: any[]
  stats: {
    streak: number
    level: number
    tasksCompleted: number
  }
}

type OverlayType = 'fief' | 'gold' | 'tournoi' | 'stats' | null

export function QuickAccessBar({ totalPoints, leaderboard, stats }: QuickAccessBarProps) {
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null)

  const buttons = [
    { id: 'fief' as const, icon: Bell, label: 'Fief' },
    { id: 'gold' as const, icon: Coins, label: 'Or' },
    { id: 'tournoi' as const, icon: Swords, label: 'Tournoi' },
    { id: 'stats' as const, icon: BarChart3, label: 'Stats' },
  ]

  return (
    <>
      <div className="flex items-center justify-center gap-3">
        {buttons.map((btn) => {
          const Icon = btn.icon
          return (
            <button
              key={btn.id}
              onClick={() => setActiveOverlay(btn.id)}
              className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl bg-cream/[0.06] border border-cream/[0.08] hover:bg-cream/[0.1] transition-all duration-200"
            >
              <Icon size={18} className="text-yellow/70" />
              <span className="font-medieval text-[10px] text-cream/40">{btn.label}</span>
            </button>
          )
        })}
      </div>

      {/* Overlay modals */}
      <AnimatePresence>
        {activeOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveOverlay(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md max-h-[80vh] bg-gradient-to-b from-charcoal to-ink rounded-2xl border border-cream/[0.08] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-cream/[0.06]">
                <h2 className="font-cinzel text-lg text-cream font-semibold">
                  {activeOverlay === 'fief' && 'Fief'}
                  {activeOverlay === 'gold' && 'Pieces d\'or'}
                  {activeOverlay === 'tournoi' && 'Tournoi'}
                  {activeOverlay === 'stats' && 'Statistiques'}
                </h2>
                <button
                  onClick={() => setActiveOverlay(null)}
                  className="p-1.5 rounded-lg hover:bg-cream/[0.06] transition-colors"
                >
                  <X size={18} className="text-cream/40" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 overflow-y-auto max-h-[65vh]">
                {activeOverlay === 'fief' && <FiefOverlayContent />}
                {activeOverlay === 'gold' && <GoldOverlayContent totalPoints={totalPoints} />}
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

function FiefOverlayContent() {
  return (
    <div className="space-y-4 text-center">
      <div className="text-4xl">🏰</div>
      <p className="font-lora text-[14px] text-cream/50">
        Votre fief est votre domaine. Gerez vos quetes, invitez des compagnons
        et personnalisez votre quartier.
      </p>
      <a href="/fief" className="inline-block font-cinzel text-[13px] text-yellow/70 hover:text-yellow transition-colors">
        Visiter le fief →
      </a>
    </div>
  )
}

function GoldOverlayContent({ totalPoints }: { totalPoints: number }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-2">💰</div>
        <p className="font-cinzel text-3xl text-yellow font-bold">{totalPoints}</p>
        <p className="font-medieval text-[11px] text-cream/30 mt-1">pieces d&apos;or</p>
      </div>
      <div className="space-y-2">
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">Comment gagner</p>
        <div className="space-y-1.5">
          {[
            { label: 'Completer une quete', value: '5-25' },
            { label: 'Serie quotidienne', value: '+5/jour' },
            { label: 'Pouvoir de personnage', value: 'variable' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-cream/[0.04]">
              <span className="font-lora text-[13px] text-cream/50">{item.label}</span>
              <span className="font-cinzel text-[13px] text-yellow/60">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TournoiOverlayContent({ leaderboard }: { leaderboard: any[] }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-3xl mb-1">⚔️</div>
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">Classement</p>
      </div>
      <div className="space-y-1">
        {leaderboard.map((member, index) => {
          const medals = ['🥇', '🥈', '🥉']
          const displayName = (member.profiles as any)?.display_name || 'Joueur'
          return (
            <div
              key={member.profile_id}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                index < 3 ? 'bg-cream/[0.04]' : ''
              }`}
            >
              <span className="w-6 text-center font-cinzel text-[14px] text-cream/40">
                {index < 3 ? medals[index] : `${index + 1}`}
              </span>
              <span className="flex-1 font-lora text-[14px] text-cream/60">{displayName}</span>
              <span className="font-cinzel text-[13px] text-yellow/60">
                {member.points_in_household || 0}
              </span>
            </div>
          )
        })}
        {leaderboard.length === 0 && (
          <p className="text-center font-lora text-[13px] text-cream/30 py-8">
            Aucun membre dans le tournoi
          </p>
        )}
      </div>
    </div>
  )
}

function StatsOverlayContent({ stats }: { stats: { streak: number; level: number; tasksCompleted: number } }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <div className="text-3xl mb-1">📊</div>
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
          Mise a jour hebdomadaire
        </p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4">
        <div className="flex flex-col items-center">
          <span className="font-cinzel text-2xl text-cream/30">2</span>
          <div className="w-16 h-12 bg-cream/[0.06] rounded-t-lg flex items-center justify-center">
            <span className="text-lg">🥈</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-cinzel text-3xl text-yellow">1</span>
          <div className="w-16 h-20 bg-yellow/[0.1] rounded-t-lg flex items-center justify-center border border-yellow/20">
            <span className="text-2xl">🥇</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-cinzel text-2xl text-cream/30">3</span>
          <div className="w-16 h-8 bg-cream/[0.06] rounded-t-lg flex items-center justify-center">
            <span className="text-lg">🥉</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-cream/[0.04] rounded-xl p-3 text-center">
          <p className="font-cinzel text-xl text-cream">{stats.tasksCompleted}</p>
          <p className="font-medieval text-[10px] text-cream/25 mt-0.5">Corvees effectuees</p>
        </div>
        <div className="bg-cream/[0.04] rounded-xl p-3 text-center">
          <p className="font-cinzel text-xl text-cream">{stats.streak}j</p>
          <p className="font-medieval text-[10px] text-cream/25 mt-0.5">Serie en cours</p>
        </div>
      </div>

      {/* Most completed task type */}
      <div className="bg-cream/[0.04] rounded-xl p-4">
        <p className="font-medieval text-[10px] text-cream/25 tracking-widest uppercase mb-2">
          Tache la plus realisee
        </p>
        <div className="flex items-center gap-2">
          <span className="text-lg">🍳</span>
          <span className="font-lora text-[14px] text-cream/50">Cuisine</span>
        </div>
      </div>
    </div>
  )
}
