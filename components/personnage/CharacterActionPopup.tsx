'use client'

import { motion } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { RARITY_COLORS } from '@/lib/characters/types'
import type { WeeklyCharacter } from '@/lib/characters/types'

interface CharacterActionPopupProps {
  character: WeeklyCharacter
  onClose: () => void
}

const POWER_ACTIONS: Record<string, { label: string; description: string }[]> = {
  category_bonus: [
    { label: 'Activer le bonus', description: 'Gagnez des points bonus sur les taches de cette categorie' },
    { label: 'Voir les taches eligibles', description: 'Consultez les taches qui beneficient du bonus' },
  ],
  point_multiplier: [
    { label: 'Activer le multiplicateur', description: 'Multipliez vos points sur la prochaine tache' },
    { label: 'Garder pour plus tard', description: 'Conservez le pouvoir pour un meilleur moment' },
  ],
  time_reduction: [
    { label: 'Reduire le temps', description: 'La prochaine tache sera plus rapide' },
    { label: 'Partager le pouvoir', description: 'Offrez la reduction a un compagnon' },
  ],
  streak_shield: [
    { label: 'Activer le bouclier', description: 'Protegez votre serie en cas d\'absence' },
    { label: 'Transferer le bouclier', description: 'Offrez la protection a un compagnon' },
  ],
}

export function CharacterActionPopup({ character, onClose }: CharacterActionPopupProps) {
  const rarityColor = RARITY_COLORS[character.rarity] || '#C4A35A'
  const actions = POWER_ACTIONS[character.power_type] || POWER_ACTIONS.category_bonus

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-foreground/40 backdrop-blur-sm flex items-end justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-3xl border border-[#E8E0D4] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: rarityColor }} />
            <h2 className="font-serif text-[16px] text-foreground font-semibold">
              Pouvoir
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X size={18} className="text-foreground/40" />
          </button>
        </div>

        {/* Power description */}
        <div className="px-5 py-3 bg-white/40">
          <p className="font-sans text-[13px] text-foreground/40">{character.power_description}</p>
        </div>

        {/* Action choices */}
        <div className="p-5 space-y-2">
          {actions.map((action, index) => (
            <button
              key={index}
              className="w-full text-left p-4 rounded-xl bg-white/40 border border-border/60 hover:bg-white/80 transition-colors group"
            >
              <p className="font-sans font-semibold text-[14px] text-foreground/70 group-hover:text-foreground transition-colors">
                {action.label}
              </p>
              <p className="font-sans text-[12px] text-foreground/25 mt-0.5">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
