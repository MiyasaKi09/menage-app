import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { CharacterThemeProvider } from '@/components/providers/CharacterThemeProvider'
import { CHARACTER_THEMES, DEFAULT_THEME, type FullTheme } from '@/lib/characters/themes'

/** Build a <style> block injected server-side so the theme is applied
 *  on first paint — before any JS runs. The unlayered :root rule wins
 *  over the @layer base :root in globals.css. */
function buildThemeStyle(t: FullTheme): string {
  return `:root {
  --deep-blue: ${t.deepBg1};
  --deep-green: ${t.deepBg2};
  --deep-purple: ${t.deepBg1};
  --deep-orange: ${t.deepBg2};
  --cream: ${t.cream};
  --off-white: ${t.offWhite};
  --charcoal: ${t.charcoal};
  --black: ${t.charcoal};
  --ink: ${t.ink};
  --border: ${t.border};
  --input: ${t.input};
  --ring: ${t.ring};
  --background: ${t.cream};
  --foreground: ${t.charcoal};
  --card: ${t.offWhite};
  --card-foreground: ${t.charcoal};
  --yellow: ${t.yellow};
  --orange: ${t.orange};
  --red: ${t.red};
  --green: ${t.green};
  --blue: ${t.blue};
  --purple: ${t.purple};
  --pink: ${t.pink};
  --primary: ${t.accent};
  --accent: ${t.accent};
  --character-primary: ${t.accent};
  --character-accent: ${t.accentSoft};
  --character-glow: ${t.glow};
}`
}

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
          weekly_id: d.out_weekly_id,
          avatar_id: d.out_avatar_id,
          avatar_name: d.out_avatar_name,
          character_class: d.out_character_class,
          rarity: d.out_rarity,
          color_theme: d.out_color_theme,
          power_type: d.out_power_type,
          power_description: d.out_power_description,
          power_value: d.out_power_value,
          lore_text: d.out_lore_text,
          is_revealed: d.out_is_revealed,
          description: d.out_description || '',
        }
      }
    }
  } catch (error) {
    console.error('Error fetching weekly character:', error)
  }

  // Resolve theme server-side
  const charClass = (weeklyCharacter as any)?.character_class || ''
  const theme = CHARACTER_THEMES[charClass] || DEFAULT_THEME

  return (
    <CharacterThemeProvider initialCharacter={weeklyCharacter}>
      {/* Inject theme CSS vars on first paint — beats @layer base in globals.css */}
      <style dangerouslySetInnerHTML={{ __html: buildThemeStyle(theme) }} />
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pb-20">
          {children}
        </main>
        <BottomTabBar />
      </div>
    </CharacterThemeProvider>
  )
}
