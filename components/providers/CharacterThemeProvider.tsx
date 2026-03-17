'use client'

import { createContext, useContext, useLayoutEffect, useState, ReactNode } from 'react'
import { CharacterTheme, CharacterPower, WeeklyCharacter } from '@/lib/characters/types'

interface CharacterThemeContextValue {
  character: WeeklyCharacter | null
  theme: CharacterTheme | null
  power: CharacterPower | null
  setCharacter: (char: WeeklyCharacter | null) => void
}

const CharacterThemeContext = createContext<CharacterThemeContextValue>({
  character: null,
  theme: null,
  power: null,
  setCharacter: () => {},
})

export function useCharacterTheme() {
  return useContext(CharacterThemeContext)
}

interface CharacterThemeProviderProps {
  children: ReactNode
  initialCharacter?: WeeklyCharacter | null
}

export function CharacterThemeProvider({ children, initialCharacter = null }: CharacterThemeProviderProps) {
  const [character, setCharacter] = useState<WeeklyCharacter | null>(initialCharacter)

  const theme = character?.color_theme ?? null
  const power: CharacterPower | null = character
    ? {
        power_type: character.power_type as CharacterPower['power_type'],
        power_value: character.power_value,
        power_description: character.power_description,
      }
    : null

  useLayoutEffect(() => {
    const root = document.documentElement
    if (theme && character?.is_revealed) {
      root.style.setProperty('--character-primary', theme.primary)
      root.style.setProperty('--character-accent', theme.accent)
      root.style.setProperty('--character-glow', theme.glow)
    } else {
      // Reset to default gold
      root.style.setProperty('--character-primary', '196 163 90')
      root.style.setProperty('--character-accent', '196 163 90')
      root.style.setProperty('--character-glow', '240 224 160')
    }
  }, [theme, character?.is_revealed])

  return (
    <CharacterThemeContext.Provider value={{ character, theme, power, setCharacter }}>
      {children}
    </CharacterThemeContext.Provider>
  )
}
