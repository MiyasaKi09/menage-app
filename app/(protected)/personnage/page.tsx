import { createClient } from '@/lib/supabase/server'
import { PersonnagePageClient } from '@/components/personnage/PersonnagePageClient'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function PersonnagePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Get weekly character (same logic as in protected layout)
  let weeklyCharacter = null
  let householdId = null
  const { data: memberships } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('profile_id', user?.id)
    .limit(1)

  if (memberships && memberships.length > 0) {
    householdId = memberships[0].household_id

    try {
      const { data, error } = await supabase.rpc('assign_weekly_character', {
        p_household_id: householdId,
        p_profile_id: user?.id,
      })

      if (error) {
        console.error('Error assigning weekly character:', error)
      }

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
    } catch (error) {
      console.error('Error fetching weekly character:', error)
    }
  }

  if (!weeklyCharacter) {
    return (
      <div className="min-h-screen relative bg-background">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="text-center space-y-4">
            <div className="text-5xl opacity-40">🃏</div>
            <h2 className="font-serif text-xl text-foreground font-semibold">Aucun personnage</h2>
            <p className="font-sans text-[14px] text-foreground/30 max-w-xs mx-auto">
              Rejoignez une cite pour recevoir votre premier personnage hebdomadaire
            </p>
            <Link href="/household/setup">
              <Button className="mt-4">Rejoindre une cite</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-background">
      <div className="relative z-10">
        <PersonnagePageClient character={weeklyCharacter} />
      </div>
    </div>
  )
}
