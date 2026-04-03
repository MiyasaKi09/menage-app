'use client'

import Image from 'next/image'
import { useCharacterTheme } from '@/components/providers/CharacterThemeProvider'
import { CLASS_EMOJIS, CLASS_IMAGES, RARITY_LABELS } from '@/lib/characters/types'

interface DashboardCharacterHeaderProps {
  displayName: string
  totalPoints: number
}

export function DashboardCharacterHeader({ displayName, totalPoints }: DashboardCharacterHeaderProps) {
  const { character } = useCharacterTheme()

  const charName = character?.avatar_name
  const charClass = character?.character_class || ''
  const imageUrl = CLASS_IMAGES[charClass]
  const emoji = CLASS_EMOJIS[charClass] || '⚔️'
  const rarity = character?.rarity ? RARITY_LABELS[character.rarity] : null
  const primary = character?.color_theme?.primary || '196 163 90'

  return (
    <div className="flex items-center gap-5">
      {/* Character portrait */}
      <div className="relative flex-shrink-0">
        <div
          className="absolute inset-0 rounded-2xl blur-3xl opacity-15"
          style={{ backgroundColor: `rgb(${primary})` }}
        />
        {imageUrl ? (
          <div className="relative w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden border border-border shadow-md">
            <Image src={imageUrl} alt={charName || ''} fill className="object-cover object-top" sizes="80px" />
          </div>
        ) : (
          <div className="w-16 h-20 md:w-20 md:h-24 rounded-xl bg-white/80 border border-border flex items-center justify-center">
            <span className="text-3xl">{emoji}</span>
          </div>
        )}
      </div>

      {/* Names + points */}
      <div className="flex-1 min-w-0">
        {charName && (
          <p className="font-serif text-xl md:text-2xl text-foreground/90 font-semibold truncate leading-tight">
            {charName}
          </p>
        )}
        <p className="font-sans text-[13px] text-foreground/35 truncate">
          {displayName}
          {rarity && (
            <span className="ml-2 font-sans text-[10px] text-foreground/20">
              · {rarity}
            </span>
          )}
        </p>
        {character?.power_description && (
          <p className="font-sans text-[11px] text-foreground/20 italic mt-0.5 truncate">
            {character.power_description}
          </p>
        )}
      </div>

      {/* Points */}
      <div className="flex-shrink-0 text-right">
        <div className="font-serif text-2xl font-semibold text-yellow">{totalPoints}</div>
        <div className="font-sans text-[10px] text-foreground/25 tracking-wider">or</div>
      </div>
    </div>
  )
}
