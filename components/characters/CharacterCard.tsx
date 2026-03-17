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
  isRevealed = true,
  isCollected = true,
  size = 'md',
  onClick,
  className,
}: CharacterCardProps) {
  const rarityColor = RARITY_COLORS[character.rarity] || RARITY_COLORS.common
  const emoji = CLASS_EMOJIS[character.character_class] || '👤'

  const sizeClasses = {
    sm: 'w-40 min-h-52',
    md: 'w-56 min-h-72',
    lg: 'w-72 min-h-96',
  }

  const textSizes = {
    sm: { name: 'text-sm', desc: 'text-[10px]', power: 'text-[10px]', emoji: 'text-4xl' },
    md: { name: 'text-lg', desc: 'text-xs', power: 'text-xs', emoji: 'text-6xl' },
    lg: { name: 'text-xl', desc: 'text-sm', power: 'text-sm', emoji: 'text-7xl' },
  }

  if (!isRevealed || !isCollected) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'relative rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1',
          'bg-gradient-to-b from-charcoal/80 to-charcoal/95 border border-charcoal/30',
          'shadow-watercolor hover:shadow-watercolor-lg',
          'flex flex-col items-center justify-center gap-3 p-4',
          className
        )}
        onClick={onClick}
      >
        <div className={cn(textSizes[size].emoji, 'opacity-20 grayscale')}>
          {emoji}
        </div>
        <div className="font-cinzel font-semibold text-cream/30 text-center">
          {isCollected ? 'Non revele' : '???'}
        </div>
        {/* Rarity stripe at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-40"
          style={{ backgroundColor: rarityColor }}
        />
      </div>
    )
  }

  // Parse theme colors for inline styles
  const primary = character.color_theme?.primary || '196 163 90'

  return (
    <div
      className={cn(
        sizeClasses[size],
        'relative rounded-xl overflow-hidden transition-all hover:-translate-y-1',
        'border border-charcoal/15 shadow-watercolor hover:shadow-watercolor-lg',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      style={{
        background: `linear-gradient(to bottom, rgb(${primary} / 0.15), rgb(var(--off-white)))`,
      }}
    >
      {/* Rarity banner */}
      <div
        className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-white font-medieval"
        style={{ backgroundColor: rarityColor, fontSize: '9px' }}
      >
        {RARITY_LABELS[character.rarity]}
      </div>

      {/* Character illustration area */}
      <div className="flex flex-col items-center pt-6 pb-3">
        <div className={cn(textSizes[size].emoji, 'mb-2')}>
          {emoji}
        </div>
        <h3 className={cn('font-cinzel font-semibold text-charcoal text-center px-3 leading-tight', textSizes[size].name)}>
          {character.avatar_name}
        </h3>
        <p className={cn('font-medieval opacity-50 text-charcoal mt-0.5', textSizes[size].desc)}>
          {character.character_class}
        </p>
      </div>

      {/* Rosette divider */}
      <div className="flex justify-center gap-2 py-1 opacity-30">
        <RosetteMini color={rarityColor} />
        <RosetteMini color={rarityColor} />
        <RosetteMini color={rarityColor} />
      </div>

      {/* Power section */}
      <div className="px-4 py-2">
        <div
          className={cn('font-lora text-center italic', textSizes[size].power)}
          style={{ color: rarityColor }}
        >
          {character.power_description}
        </div>
      </div>

      {/* Lore text */}
      {size !== 'sm' && (
        <div className="px-4 pb-4">
          <p className="font-lora text-[10px] text-charcoal/50 text-center leading-relaxed line-clamp-2">
            {character.lore_text}
          </p>
        </div>
      )}

      {/* Bottom rarity stripe */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: rarityColor, opacity: 0.5 }}
      />
    </div>
  )
}

function RosetteMini({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <ellipse cx="6" cy="6" rx="2" ry="4.5" fill={color} opacity="0.5" />
      <ellipse cx="6" cy="6" rx="2" ry="4.5" fill={color} opacity="0.5" transform="rotate(90 6 6)" />
      <circle cx="6" cy="6" r="1.5" fill={color} opacity="0.7" />
    </svg>
  )
}
