'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { Character, RARITY_COLORS, RARITY_LABELS, CLASS_EMOJIS, CLASS_IMAGES } from '@/lib/characters/types'

interface CharacterCardProps {
  character: Character
  isRevealed?: boolean
  isCollected?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

export function CharacterCard({
  character,
  isRevealed: _isRevealed = true,
  isCollected = true,
  size = 'md',
  onClick,
  className,
}: CharacterCardProps) {
  const rarityColor = RARITY_COLORS[character.rarity] || RARITY_COLORS.common
  const emoji = CLASS_EMOJIS[character.character_class] || '👤'
  const imageUrl = CLASS_IMAGES[character.character_class]
  const primary = character.color_theme?.primary || '196 163 90'

  const sizes = {
    sm: { card: 'aspect-[3/4]', name: 'text-[13px]', power: 'text-[10px]' },
    md: { card: 'aspect-[3/4]', name: 'text-[15px]', power: 'text-[12px]' },
    lg: { card: 'aspect-[3/4]', name: 'text-lg', power: 'text-[13px]' },
  }
  const s = sizes[size]

  if (!isCollected) {
    return (
      <div
        className={cn(
          s.card,
          'rounded-2xl bg-charcoal/[0.03] border border-charcoal/[0.04] flex flex-col items-center justify-center transition-all duration-300',
          onClick && 'cursor-pointer hover:bg-charcoal/[0.05]',
          className
        )}
        onClick={onClick}
      >
        <span className="text-4xl grayscale opacity-10">{emoji}</span>
        <span className="font-cinzel text-[12px] text-cream/15 mt-2">???</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        s.card,
        'rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        'border border-charcoal/[0.06] relative group',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Character illustration */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={character.avatar_name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(to bottom, rgb(${primary} / 0.15), rgb(var(--off-white)))` }}
        >
          <span className="text-5xl">{emoji}</span>
        </div>
      )}

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Rarity badge */}
      <span
        className="absolute top-3 right-3 font-medieval text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm"
        style={{ color: 'white', backgroundColor: rarityColor + '80' }}
      >
        {RARITY_LABELS[character.rarity]}
      </span>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className={cn('font-cinzel font-semibold text-white leading-tight drop-shadow-md', s.name)}>
          {character.avatar_name}
        </h3>
        <p
          className={cn('font-lora italic leading-snug mt-1 text-white/70', s.power)}
        >
          {character.power_description}
        </p>
      </div>
    </div>
  )
}
