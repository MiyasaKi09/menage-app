import { createClient } from '@/lib/supabase/server'
import { ProfilPageClient } from '@/components/profil/ProfilPageClient'

export default async function ProfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch achievements
  const { data: achievements } = await supabase
    .from('profile_achievements')
    .select('*, achievements(name, description, emoji)')
    .eq('profile_id', user?.id)

  return (
    <div className="min-h-screen relative bg-background">
      <div className="relative z-10">
        <ProfilPageClient
          profile={profile || {}}
          email={user?.email || ''}
          achievements={achievements || []}
        />
      </div>
    </div>
  )
}
