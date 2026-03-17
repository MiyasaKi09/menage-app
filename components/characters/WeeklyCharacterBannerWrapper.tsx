'use client'

import { useCharacterTheme } from '@/components/providers/CharacterThemeProvider'
import { WeeklyCharacterBanner } from './WeeklyCharacterBanner'

export function WeeklyCharacterBannerWrapper() {
  const { character } = useCharacterTheme()

  // Character is loaded server-side in the protected layout
  // If no character exists (no household or migration not run), don't render
  if (!character) return null

  return <WeeklyCharacterBanner weeklyCharacter={character} />
}
