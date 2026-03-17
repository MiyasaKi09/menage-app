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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-watercolor-lg animate-reveal"
        style={{
          background: `linear-gradient(to bottom, rgb(${primary} / 0.2), rgb(var(--off-white)))`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-charcoal/10 flex items-center justify-center text-charcoal/50 hover:bg-charcoal/20 transition-colors z-10"
        >
          x
        </button>

        {/* Rarity banner */}
        <div className="flex justify-center pt-4">
          <span
            className="px-3 py-1 rounded-full text-white font-medieval text-xs"
            style={{ backgroundColor: rarityColor }}
          >
            {RARITY_LABELS[character.rarity]}
          </span>
        </div>

        {/* Character */}
        <div className="flex flex-col items-center pt-4 pb-2 px-6">
          <div className="text-7xl mb-3 animate-float">{emoji}</div>
          <h2 className="font-cinzel text-2xl font-semibold text-charcoal text-center">
            {character.avatar_name}
          </h2>
          <p className="font-medieval text-sm opacity-50 text-charcoal">
            {character.character_class}
          </p>
        </div>

        {/* Rosette divider */}
        <div className="flex justify-center gap-3 py-2 opacity-25">
          {[0, 1, 2, 3, 4].map(i => (
            <svg key={i} width="10" height="10" viewBox="0 0 10 10">
              <ellipse cx="5" cy="5" rx="1.5" ry="4" fill={rarityColor} opacity="0.6" />
              <ellipse cx="5" cy="5" rx="1.5" ry="4" fill={rarityColor} opacity="0.6" transform="rotate(90 5 5)" />
              <circle cx="5" cy="5" r="1" fill={rarityColor} opacity="0.8" />
            </svg>
          ))}
        </div>

        {/* Power */}
        <div className="px-6 py-3 text-center">
          <p className="font-medieval text-[10px] uppercase tracking-wider opacity-40 text-charcoal mb-1">
            Pouvoir
          </p>
          <p
            className="font-lora text-base italic font-medium"
            style={{ color: rarityColor }}
          >
            {character.power_description}
          </p>
        </div>

        {/* Lore */}
        <div className="px-6 pb-4 text-center">
          <p className="font-lora text-sm text-charcoal/60 leading-relaxed italic">
            &ldquo;{character.lore_text}&rdquo;
          </p>
        </div>

        {/* Stats */}
        {character.is_collected && character.times_received > 0 && (
          <div className="border-t border-charcoal/8 px-6 py-3 flex justify-center">
            <p className="font-medieval text-xs text-charcoal/40">
              Obtenu {character.times_received} fois
            </p>
          </div>
        )}

        {/* Bottom rarity stripe */}
        <div
          className="h-1"
          style={{ backgroundColor: rarityColor, opacity: 0.4 }}
        />
      </div>
    </div>
  )
}
