import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CharacterGallery } from '@/components/characters/CharacterGallery'
import { WeeklyCharacterHero } from '@/components/characters/WeeklyCharacterHero'

export default async function CharactersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load collection
  let characters: any[] = []
  let debugInfo = ''

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_character_collection', {
    p_profile_id: user.id,
  })

  if (rpcError) {
    debugInfo = `RPC: ${rpcError.message}`

    // Fallback: query avatars directly
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('avatars')
      .select('id, name, description, character_class, rarity, color_theme, power_type, power_description, power_value, lore_text, is_weekly_eligible')
      .eq('is_weekly_eligible', true)
      .order('name')

    if (!fallbackError && fallbackData) {
      characters = fallbackData.map(a => ({
        avatar_id: a.id,
        avatar_name: a.name,
        description: a.description,
        character_class: a.character_class,
        rarity: a.rarity,
        color_theme: a.color_theme,
        power_type: a.power_type,
        power_description: a.power_description,
        power_value: a.power_value,
        lore_text: a.lore_text,
        times_received: 0,
        is_favorite: false,
        is_collected: false,
      }))
      debugInfo += ` | fallback: ${characters.length}`
    }
  } else if (rpcData) {
    characters = rpcData.map((d: any) => ({
      avatar_id: d.out_avatar_id,
      avatar_name: d.out_avatar_name,
      description: d.out_description,
      character_class: d.out_character_class,
      rarity: d.out_rarity,
      color_theme: d.out_color_theme,
      power_type: d.out_power_type,
      power_description: d.out_power_description,
      power_value: d.out_power_value,
      lore_text: d.out_lore_text,
      times_received: d.out_times_received,
      is_favorite: d.out_is_favorite,
      is_collected: d.out_is_collected,
    }))
    debugInfo = `${characters.length} personnages`
  }

  return (
    <div className="min-h-screen relative bg-background">

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10 space-y-14">

        {/* Hero: Weekly Character */}
        <WeeklyCharacterHero />

        {/* Separator */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border/60" />
          <p className="font-sans text-[11px] text-foreground/20 tracking-widest uppercase">
            Collection
          </p>
          <div className="flex-1 h-px bg-border/60" />
        </div>

        {/* Collection Gallery */}
        <CharacterGallery characters={characters} />

        {/* Debug */}
        <p className="font-sans text-[9px] text-foreground/10 text-center">
          {debugInfo}
        </p>
      </div>
    </div>
  )
}
