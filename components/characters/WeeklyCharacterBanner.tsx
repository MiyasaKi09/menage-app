'use client'

import Link from 'next/link'
import Image from 'next/image'
import { WeeklyCharacter, RARITY_LABELS, CLASS_EMOJIS, CLASS_IMAGES } from '@/lib/characters/types'

interface WeeklyCharacterBannerProps {
  weeklyCharacter: WeeklyCharacter
}

export function WeeklyCharacterBanner({ weeklyCharacter }: WeeklyCharacterBannerProps) {
  const emoji = CLASS_EMOJIS[weeklyCharacter.character_class] || '👤'
  const imageUrl = CLASS_IMAGES[weeklyCharacter.character_class]
  const primary = weeklyCharacter.color_theme?.primary || '196 163 90'

  return (
    <div className="flex items-center gap-4 py-4 border-b border-cream/[0.06]">
      <div className="relative flex-shrink-0">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20"
          style={{ backgroundColor: `rgb(${primary})` }}
        />
        {imageUrl ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-cream/20">
            <Image src={imageUrl} alt={weeklyCharacter.avatar_name} fill className="object-cover object-top" sizes="48px" />
          </div>
        ) : (
          <span className="relative text-3xl">{emoji}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-cinzel text-[15px] text-cream/80 truncate">{weeklyCharacter.avatar_name}</p>
          <span className="font-medieval text-[10px] text-cream/25">
            {RARITY_LABELS[weeklyCharacter.rarity]}
          </span>
        </div>
        <p className="font-lora text-[12px] text-cream/30 italic truncate">{weeklyCharacter.power_description}</p>
      </div>
      <Link href="/characters" className="flex-shrink-0">
        <span className="font-medieval text-[11px] text-cream/15 hover:text-cream/35 transition-colors duration-200">
          Collection
        </span>
      </Link>
    </div>
  )
}
