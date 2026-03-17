import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CharacterGallery } from '@/components/characters/CharacterGallery'

export default async function CharactersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Try RPC first
  let characters: any[] = []
  let debugInfo = ''

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_character_collection', {
    p_profile_id: user.id,
  })

  if (rpcError) {
    debugInfo = `RPC error: ${rpcError.message} (${rpcError.code})`
    console.error('RPC get_character_collection error:', rpcError)

    // Fallback: query avatars table directly
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('avatars')
      .select('id, name, description, character_class, rarity, color_theme, power_type, power_description, power_value, lore_text, is_weekly_eligible')
      .eq('is_weekly_eligible', true)
      .order('name')

    if (fallbackError) {
      debugInfo += ` | Fallback error: ${fallbackError.message}`
      console.error('Fallback query error:', fallbackError)
    } else if (fallbackData) {
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
      debugInfo += ` | Fallback OK: ${characters.length} avatars`
    }
  } else {
    characters = rpcData || []
    debugInfo = `RPC OK: ${characters.length} avatars`
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-b from-deep-purple to-deep-green transition-colors duration-700" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase mb-1">
            Collection
          </p>
          <h1 className="font-cinzel text-3xl md:text-4xl text-cream font-semibold tracking-tight">
            Personnages
          </h1>
          <p className="font-lora text-[14px] text-cream/30 mt-2">
            Chaque semaine, un nouveau compagnon rejoint votre aventure
          </p>
          {/* Debug - remove after fixing */}
          <p className="font-medieval text-[10px] text-cream/15 mt-4">
            {debugInfo}
          </p>
        </div>

        <CharacterGallery characters={characters} />
      </div>
    </div>
  )
}
