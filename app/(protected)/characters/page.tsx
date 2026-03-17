import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CharacterGallery } from '@/components/characters/CharacterGallery'
import { DiagonalStripe } from '@/components/ui/DiagonalStripe'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export default async function CharactersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch character collection
  const { data: characters, error } = await supabase.rpc('get_character_collection', {
    p_profile_id: user.id,
  })

  if (error) {
    console.error('Error fetching collection:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-purple to-deep-green relative overflow-hidden">
      <GrainOverlay opacity={0.06} />
      <DiagonalStripe position="top-right" />
      <DiagonalStripe position="bottom-left" />

      <div className="relative z-10 p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <div className="font-medieval text-xs opacity-40 tracking-wider mb-1 text-cream">
            Votre collection
          </div>
          <h1 className="font-cinzel text-4xl md:text-5xl text-cream font-semibold leading-none">
            Personnages
          </h1>
          <p className="font-lora text-sm text-cream/50 mt-2">
            Chaque semaine, un nouveau compagnon rejoint votre aventure
          </p>
        </div>

        {/* Gallery */}
        <CharacterGallery characters={characters || []} />
      </div>
    </div>
  )
}
