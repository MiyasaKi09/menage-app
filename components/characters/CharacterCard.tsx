'use client'

import { cn } from '@/lib/utils/cn'
import { Character, RARITY_COLORS, RARITY_LABELS, CLASS_EMOJIS } from '@/lib/characters/types'

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
  const primary = character.color_theme?.primary || '196 163 90'

  const sizes = {
    sm: { card: 'aspect-[3/4]', emoji: 'text-4xl', name: 'text-[13px]', power: 'text-[10px]' },
    md: { card: 'aspect-[3/4]', emoji: 'text-5xl', name: 'text-[15px]', power: 'text-[12px]' },
    lg: { card: 'aspect-[3/4]', emoji: 'text-6xl', name: 'text-lg', power: 'text-[13px]' },
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
        <span className={cn(s.emoji, 'grayscale opacity-10')}>{emoji}</span>
        <span className="font-cinzel text-[12px] text-cream/15 mt-2">???</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        s.card,
        'rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        'border border-charcoal/[0.06]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      style={{ background: `linear-gradient(to bottom, rgb(${primary} / 0.1), rgb(var(--off-white)))` }}
    >
      <div className="h-full flex flex-col items-center justify-between p-5">
        {/* Top: rarity */}
        <span
          className="self-end font-medieval text-[9px] px-2 py-0.5 rounded-full"
          style={{ color: rarityColor, backgroundColor: rarityColor + '15' }}
        >
          {RARITY_LABELS[character.rarity]}
        </span>

        {/* Center: emoji + name */}
        <div className="text-center">
          <div className={s.emoji}>{emoji}</div>
          <h3 className={cn('font-cinzel font-semibold text-charcoal mt-2 leading-tight', s.name)}>
            {character.avatar_name}
          </h3>
        </div>

        {/* Bottom: power */}
        <p
          className={cn('font-lora italic text-center leading-snug', s.power)}
          style={{ color: rarityColor + 'aa' }}
        >
          {character.power_description}
        </p>
      </div>
    </div>
  )
}
