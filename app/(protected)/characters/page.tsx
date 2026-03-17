import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CharacterGallery } from '@/components/characters/CharacterGallery'

export default async function CharactersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: characters, error } = await supabase.rpc('get_character_collection', {
    p_profile_id: user.id,
  })

  if (error) console.error('Error fetching collection:', error)

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
        </div>

        <CharacterGallery characters={characters || []} />
      </div>
    </div>
  )
}
