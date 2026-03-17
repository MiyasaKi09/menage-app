'use client'

import { useCharacterTheme } from '@/components/providers/CharacterThemeProvider'
import { WeeklyCharacterBanner } from './WeeklyCharacterBanner'

export function WeeklyCharacterBannerWrapper() {
  const { character } = useCharacterTheme()

  if (!character) return null

  return <WeeklyCharacterBanner weeklyCharacter={character} />
}
