'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WeeklyCharacter, RARITY_LABELS, CLASS_EMOJIS } from '@/lib/characters/types'
import { useCharacterTheme } from '@/components/providers/CharacterThemeProvider'
import { createClient } from '@/lib/supabase/client'

interface WeeklyCharacterBannerProps {
  weeklyCharacter: WeeklyCharacter
}

export function WeeklyCharacterBanner({ weeklyCharacter }: WeeklyCharacterBannerProps) {
  const { setCharacter } = useCharacterTheme()
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealed, setRevealed] = useState(weeklyCharacter.is_revealed)
  const router = useRouter()
  const supabase = createClient()

  const emoji = CLASS_EMOJIS[weeklyCharacter.character_class] || '👤'

  const handleReveal = async () => {
    setIsRevealing(true)
    try {
      await supabase.rpc('reveal_weekly_character', { p_weekly_id: weeklyCharacter.weekly_id })
      await new Promise(resolve => setTimeout(resolve, 600))
      setRevealed(true)
      setCharacter({ ...weeklyCharacter, is_revealed: true })
      router.refresh()
    } catch (error) {
      console.error('Error revealing:', error)
    } finally {
      setIsRevealing(false)
    }
  }

  if (!revealed) {
    return (
      <button
        onClick={handleReveal}
        disabled={isRevealing}
        className="w-full group flex items-center gap-4 py-4 border-b border-cream/[0.06] text-left transition-all duration-200"
      >
        <span className={`text-2xl opacity-30 ${isRevealing ? 'animate-spin-slow' : 'animate-float'}`}>🃏</span>
        <div className="flex-1">
          <p className="font-cinzel text-[14px] text-cream/50 group-hover:text-cream/70 transition-colors duration-200">
            {isRevealing ? 'Revelation...' : 'Decouvrez votre personnage de la semaine'}
          </p>
        </div>
        {!isRevealing && (
          <span className="font-cinzel text-[12px] text-yellow/50 group-hover:text-yellow/80 transition-colors duration-200">
            Reveler
          </span>
        )}
      </button>
    )
  }

  const primary = weeklyCharacter.color_theme?.primary || '196 163 90'

  return (
    <div className="animate-fade-in flex items-center gap-4 py-4 border-b border-cream/[0.06]">
      <div className="relative flex-shrink-0">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20"
          style={{ backgroundColor: `rgb(${primary})` }}
        />
        <span className="relative text-3xl animate-float">{emoji}</span>
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
