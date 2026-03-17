'use client'

import { useEffect } from 'react'
import { useCharacterTheme } from '@/components/providers/CharacterThemeProvider'
import { WeeklyCharacterBanner } from './WeeklyCharacterBanner'
import { createClient } from '@/lib/supabase/client'

export function WeeklyCharacterBannerWrapper() {
  const { character, setCharacter } = useCharacterTheme()
  const supabase = createClient()

  // Auto-assign a character if none exists
  useEffect(() => {
    if (character) return

    async function assignCharacter() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Try to assign a weekly character
        const { error } = await supabase.rpc('assign_weekly_character', {
          p_profile_id: user.id,
        })

        if (error) {
          console.error('Error auto-assigning character:', error)
          return
        }

        // Fetch the newly assigned character
        const { data: weekly } = await supabase.rpc('get_weekly_character', {
          p_profile_id: user.id,
        })

        if (weekly) {
          setCharacter({ ...weekly, is_revealed: true })
        }
      } catch (err) {
        console.error('Error in auto-assign:', err)
      }
    }

    assignCharacter()
  }, [character, setCharacter, supabase])

  if (!character) return null

  return <WeeklyCharacterBanner weeklyCharacter={character} />
}
