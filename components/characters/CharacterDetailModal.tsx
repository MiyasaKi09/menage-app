'use client'

import { CollectionCharacter, RARITY_COLORS, RARITY_LABELS, CLASS_EMOJIS } from '@/lib/characters/types'

interface CharacterDetailModalProps {
  character: CollectionCharacter
  onClose: () => void
}

export function CharacterDetailModal({ character, onClose }: CharacterDetailModalProps) {
  const emoji = CLASS_EMOJIS[character.character_class] || '👤'
  const rarityColor = RARITY_COLORS[character.rarity] || RARITY_COLORS.common
  const primary = character.color_theme?.primary || '196 163 90'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-lg animate-reveal"
        style={{ background: `linear-gradient(to bottom, rgb(${primary} / 0.12), rgb(var(--off-white)))` }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-charcoal/25 hover:text-charcoal/50 hover:bg-charcoal/[0.04] transition-all duration-200 z-10 text-[13px]"
        >
          ✕
        </button>

        <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
          {/* Rarity */}
          <span
            className="font-medieval text-[10px] px-3 py-1 rounded-full mb-6"
            style={{ color: rarityColor, backgroundColor: rarityColor + '12' }}
          >
            {RARITY_LABELS[character.rarity]}
          </span>

          {/* Emoji */}
          <div className="text-6xl mb-4 animate-float">{emoji}</div>

          {/* Name */}
          <h2 className="font-cinzel text-2xl font-semibold text-charcoal">{character.avatar_name}</h2>

          {/* Power */}
          <p
            className="font-lora text-[14px] italic mt-4"
            style={{ color: rarityColor }}
          >
            {character.power_description}
          </p>

          {/* Lore */}
          <p className="font-lora text-[13px] text-charcoal/35 mt-6 leading-relaxed">
            {character.lore_text}
          </p>

          {/* Stats */}
          {character.is_collected && character.times_received > 0 && (
            <p className="font-medieval text-[11px] text-charcoal/20 mt-6">
              Obtenu {character.times_received} fois
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
