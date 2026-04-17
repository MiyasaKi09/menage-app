'use client'

import { FlippableCharacterCard } from './FlippableCharacterCard'
import { CHARACTER_THEMES, DEFAULT_THEME } from '@/lib/characters/themes'
import type { WeeklyCharacter } from '@/lib/characters/types'

interface PersonnagePageClientProps {
  character: WeeklyCharacter
}

export function PersonnagePageClient({ character }: PersonnagePageClientProps) {
  const theme = CHARACTER_THEMES[character.character_class] || DEFAULT_THEME

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 pb-24 relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, rgb(${theme.deepBg1}) 0%, rgb(${theme.deepBg2}) 50%, rgb(${theme.deepBg1}) 100%)`,
      }}
    >
      {/* Ambient glow orbs matching character palette */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgb(${theme.glow}/0.18) 0%, transparent 70%)` }}
      />
      <div
        className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgb(${theme.accent}/0.14) 0%, transparent 70%)` }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-64 pointer-events-none"
        style={{ background: `radial-gradient(ellipse, rgb(${theme.accent}/0.06) 0%, transparent 60%)` }}
      />

      {/* Card with accent glow halo */}
      <div className="relative w-full max-w-sm">
        {/* Halo behind card */}
        <div
          className="absolute inset-[-24px] rounded-3xl pointer-events-none blur-2xl"
          style={{ background: `radial-gradient(ellipse, rgb(${theme.accent}/0.25) 0%, transparent 70%)` }}
        />
        <FlippableCharacterCard character={character} />
      </div>
    </div>
  )
}
