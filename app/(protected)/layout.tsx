import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { CharacterThemeProvider } from '@/components/providers/CharacterThemeProvider'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch weekly character for theme
  let weeklyCharacter = null
  try {
    const { data: memberships } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('profile_id', user.id)
      .limit(1)

    if (memberships && memberships.length > 0) {
      const { data } = await supabase.rpc('assign_weekly_character', {
        p_household_id: memberships[0].household_id,
        p_profile_id: user.id,
      })

      if (data && data.length > 0) {
        const d = data[0]
        weeklyCharacter = {
          weekly_id: d.weekly_id,
          avatar_id: d.avatar_id,
          avatar_name: d.avatar_name,
          character_class: d.character_class,
          rarity: d.rarity,
          color_theme: d.color_theme,
          power_type: d.power_type,
          power_description: d.power_description,
          power_value: d.power_value,
          lore_text: d.lore_text,
          is_revealed: d.is_revealed,
          description: '',
        }
      }
    }
  } catch (error) {
    console.error('Error fetching weekly character:', error)
    // Non-blocking - continue without character
  }

  return (
    <CharacterThemeProvider initialCharacter={weeklyCharacter}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pb-20">
          {children}
        </main>
        <BottomTabBar />
      </div>
    </CharacterThemeProvider>
  )
}
