'use client'

import { createContext, useContext, useLayoutEffect, useState, ReactNode } from 'react'
import { CharacterPower, WeeklyCharacter } from '@/lib/characters/types'
import { CHARACTER_THEMES, DEFAULT_THEME, FullTheme } from '@/lib/characters/themes'

interface CharacterThemeContextValue {
  character: WeeklyCharacter | null
  theme: FullTheme
  power: CharacterPower | null
  setCharacter: (char: WeeklyCharacter | null) => void
}

const CharacterThemeContext = createContext<CharacterThemeContextValue>({
  character: null,
  theme: DEFAULT_THEME,
  power: null,
  setCharacter: () => {},
})

export function useCharacterTheme() {
  return useContext(CharacterThemeContext)
}

function applyTheme(theme: FullTheme) {
  const root = document.documentElement
  // Replace ALL site colors based on character
  root.style.setProperty('--deep-green', theme.deepBg1)
  root.style.setProperty('--deep-blue', theme.deepBg2)
  root.style.setProperty('--deep-purple', theme.deepBg1)
  root.style.setProperty('--deep-orange', theme.deepBg1)
  root.style.setProperty('--yellow', theme.accent)
  root.style.setProperty('--orange', theme.warm)
  root.style.setProperty('--green', theme.secondary)
  root.style.setProperty('--blue', theme.secondarySoft)
  root.style.setProperty('--purple', theme.accentSoft)
  root.style.setProperty('--pink', theme.warm)
  root.style.setProperty('--cream', theme.cream)
  root.style.setProperty('--off-white', theme.offWhite)
  root.style.setProperty('--charcoal', theme.charcoal)
  root.style.setProperty('--ink', theme.ink)
  root.style.setProperty('--character-primary', theme.accent)
  root.style.setProperty('--character-accent', theme.accentSoft)
  root.style.setProperty('--character-glow', theme.glow)
}

interface CharacterThemeProviderProps {
  children: ReactNode
  initialCharacter?: WeeklyCharacter | null
}

export function CharacterThemeProvider({ children, initialCharacter = null }: CharacterThemeProviderProps) {
  const [character, setCharacter] = useState<WeeklyCharacter | null>(initialCharacter)

  const charClass = character?.character_class || ''
  const theme = (character?.is_revealed && CHARACTER_THEMES[charClass]) || DEFAULT_THEME

  const power: CharacterPower | null = character?.is_revealed
    ? {
        power_type: character.power_type as CharacterPower['power_type'],
        power_value: character.power_value,
        power_description: character.power_description,
      }
    : null

  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <CharacterThemeContext.Provider value={{ character, theme, power, setCharacter }}>
      {children}
    </CharacterThemeContext.Provider>
  )
}
