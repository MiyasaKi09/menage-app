'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WeeklyCharacter, RARITY_COLORS, RARITY_LABELS, CLASS_EMOJIS } from '@/lib/characters/types'
import { useCharacterTheme } from '@/components/providers/CharacterThemeProvider'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

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
  const rarityColor = RARITY_COLORS[weeklyCharacter.rarity] || RARITY_COLORS.common

  const handleReveal = async () => {
    setIsRevealing(true)
    try {
      await supabase.rpc('reveal_weekly_character', {
        p_weekly_id: weeklyCharacter.weekly_id,
      })
      await new Promise(resolve => setTimeout(resolve, 800))
      setRevealed(true)
      setCharacter({ ...weeklyCharacter, is_revealed: true })
      router.refresh()
    } catch (error) {
      console.error('Error revealing character:', error)
    } finally {
      setIsRevealing(false)
    }
  }

  // Unrevealed
  if (!revealed) {
    return (
      <button
        onClick={handleReveal}
        disabled={isRevealing}
        className="w-full group relative rounded-2xl overflow-hidden bg-cream/6 backdrop-blur-sm border border-cream/10 hover:border-cream/20 transition-all p-6 text-left cursor-pointer"
      >
        <div className="flex items-center gap-5">
          <div className={`text-5xl ${isRevealing ? 'animate-spin-slow' : 'animate-float'} opacity-40`}>
            🃏
          </div>
          <div className="flex-1">
            <p className="font-cinzel text-lg font-semibold text-cream/70 group-hover:text-cream transition-colors">
              {isRevealing ? 'Revelation en cours...' : 'Decouvrez votre personnage'}
            </p>
            <p className="font-medieval text-xs text-cream/30 mt-0.5">
              Un compagnon vous attend pour cette semaine
            </p>
          </div>
          {!isRevealing && (
            <div className="px-4 py-2 rounded-lg bg-yellow/15 border border-yellow/20 font-cinzel text-sm text-yellow">
              Reveler
            </div>
          )}
        </div>
      </button>
    )
  }

  // Revealed
  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-cream/12 animate-reveal"
      style={{
        background: `linear-gradient(135deg, rgba(${weeklyCharacter.color_theme?.primary || '196 163 90'} / 0.15), rgba(${weeklyCharacter.color_theme?.glow || '240 224 160'} / 0.05))`,
      }}
    >
      {/* Subtle backdrop blur */}
      <div className="backdrop-blur-sm p-5 md:p-6">
        <div className="flex items-center gap-5">
          {/* Character emoji with glow */}
          <div className="relative flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-30"
              style={{ backgroundColor: `rgb(${weeklyCharacter.color_theme?.glow || '240 224 160'})` }}
            />
            <div className="relative text-5xl md:text-6xl animate-float">
              {emoji}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-cinzel text-lg md:text-xl font-semibold text-cream truncate">
                {weeklyCharacter.avatar_name}
              </h3>
              <span
                className="px-2 py-0.5 rounded-full font-medieval flex-shrink-0"
                style={{
                  backgroundColor: rarityColor + '30',
                  color: rarityColor,
                  fontSize: '10px',
                  border: `1px solid ${rarityColor}40`,
                }}
              >
                {RARITY_LABELS[weeklyCharacter.rarity]}
              </span>
            </div>
            <p className="font-lora text-sm text-cream/50 italic">
              {weeklyCharacter.power_description}
            </p>
          </div>

          {/* Collection link */}
          <Link href="/characters" className="flex-shrink-0 hidden md:block">
            <Button variant="ghost" size="sm" className="text-cream/40 hover:text-cream/70">
              Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
