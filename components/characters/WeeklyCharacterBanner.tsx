'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
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

      // Small delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 600))

      setRevealed(true)
      setCharacter({ ...weeklyCharacter, is_revealed: true })
      router.refresh()
    } catch (error) {
      console.error('Error revealing character:', error)
    } finally {
      setIsRevealing(false)
    }
  }

  // Unrevealed state
  if (!revealed) {
    return (
      <div className="relative border border-charcoal/12 rounded-xl overflow-hidden bg-gradient-to-r from-charcoal/90 to-charcoal/80 shadow-watercolor-lg">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="text-4xl opacity-30 animate-float">🃏</div>
            <div>
              <p className="font-cinzel text-lg font-semibold text-cream/80">
                Personnage de la semaine
              </p>
              <p className="font-medieval text-xs text-cream/40">
                Un nouveau compagnon vous attend...
              </p>
            </div>
          </div>
          <Button
            onClick={handleReveal}
            disabled={isRevealing}
            size="sm"
          >
            {isRevealing ? 'Revelation...' : 'Reveler'}
          </Button>
        </div>
      </div>
    )
  }

  // Revealed state
  const primary = weeklyCharacter.color_theme?.primary || '196 163 90'

  return (
    <div
      className={cn(
        'relative border border-charcoal/12 rounded-xl overflow-hidden shadow-watercolor-lg animate-reveal'
      )}
      style={{
        background: `linear-gradient(135deg, rgb(${primary} / 0.2), rgb(var(--off-white)))`,
      }}
    >
      <div className="flex items-center gap-4 p-5">
        {/* Character emoji */}
        <div className="text-4xl animate-float flex-shrink-0">
          {emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-cinzel text-lg font-semibold text-charcoal truncate">
              {weeklyCharacter.avatar_name}
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-white font-medieval flex-shrink-0"
              style={{ backgroundColor: rarityColor, fontSize: '9px' }}
            >
              {RARITY_LABELS[weeklyCharacter.rarity]}
            </span>
          </div>
          <p
            className="font-lora text-sm italic"
            style={{ color: rarityColor }}
          >
            {weeklyCharacter.power_description}
          </p>
        </div>

        {/* View collection link */}
        <a href="/characters" className="flex-shrink-0">
          <Button variant="ghost" size="sm" className="font-medieval text-xs">
            Collection
          </Button>
        </a>
      </div>

      {/* Bottom rarity stripe */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: rarityColor, opacity: 0.4 }}
      />
    </div>
  )
}
