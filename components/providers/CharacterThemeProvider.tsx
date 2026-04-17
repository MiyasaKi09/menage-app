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
  const r = document.documentElement

  // ── Dark backgrounds ─────────────────────────────────────────────────
  r.style.setProperty('--deep-blue',    theme.deepBg1)
  r.style.setProperty('--deep-green',   theme.deepBg2)
  r.style.setProperty('--deep-purple',  theme.deepBg1)
  r.style.setProperty('--deep-orange',  theme.deepBg2)

  // ── Light backgrounds ────────────────────────────────────────────────
  r.style.setProperty('--cream',        theme.cream)
  r.style.setProperty('--off-white',    theme.offWhite)

  // ── Text ─────────────────────────────────────────────────────────────
  r.style.setProperty('--charcoal',     theme.charcoal)
  r.style.setProperty('--black',        theme.charcoal)
  r.style.setProperty('--ink',          theme.ink)

  // ── Borders & inputs ─────────────────────────────────────────────────
  r.style.setProperty('--border',       theme.border)
  r.style.setProperty('--input',        theme.input)
  r.style.setProperty('--ring',         theme.ring)

  // ── Semantic ─────────────────────────────────────────────────────────
  r.style.setProperty('--background',        theme.cream)
  r.style.setProperty('--foreground',        theme.charcoal)
  r.style.setProperty('--card',              theme.offWhite)
  r.style.setProperty('--card-foreground',   theme.charcoal)

  // ── Named accent palette ─────────────────────────────────────────────
  r.style.setProperty('--yellow',       theme.yellow)
  r.style.setProperty('--orange',       theme.orange)
  r.style.setProperty('--red',          theme.red)
  r.style.setProperty('--green',        theme.green)
  r.style.setProperty('--blue',         theme.blue)
  r.style.setProperty('--purple',       theme.purple)
  r.style.setProperty('--pink',         theme.pink)

  // ── Accent (primary) ─────────────────────────────────────────────────
  r.style.setProperty('--primary',      theme.accent)
  r.style.setProperty('--accent',       theme.accent)

  // ── Character-specific ───────────────────────────────────────────────
  r.style.setProperty('--character-primary', theme.accent)
  r.style.setProperty('--character-accent',  theme.accentSoft)
  r.style.setProperty('--character-glow',    theme.glow)
}

interface CharacterThemeProviderProps {
  children: ReactNode
  initialCharacter?: WeeklyCharacter | null
}

export function CharacterThemeProvider({
  children,
  initialCharacter = null,
}: CharacterThemeProviderProps) {
  const [character, setCharacter] = useState<WeeklyCharacter | null>(initialCharacter)

  const charClass = character?.character_class || ''
  const theme = CHARACTER_THEMES[charClass] || DEFAULT_THEME

  const power: CharacterPower | null = character
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
