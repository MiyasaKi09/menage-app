import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Vérifier que l'utilisateur est membre de ce foyer
  const { data: membership } = await supabase
    .from('household_members')
    .select('role')
    .eq('household_id', id)
    .eq('profile_id', user.id)
    .single()

  if (!membership) {
    redirect('/household')
  }

  // Récupérer les informations du foyer
  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('id', id)
    .single()

  // Récupérer tous les membres
  const { data: members } = await supabase
    .from('household_members')
    .select(`
      id,
      role,
      joined_at,
      points_in_household,
      tasks_completed_in_household,
      profiles (
        id,
        display_name,
        username,
        email
      )
    `)
    .eq('household_id', id)
    .order('points_in_household', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/household" className="text-sm text-muted-foreground hover:underline mb-2 block">
            ← Retour aux foyers
          </Link>
          <h1 className="text-3xl font-bold">{household?.name}</h1>
          <p className="text-muted-foreground">
            {members?.length || 0} membre{(members?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du foyer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Code d'invitation</p>
              <p className="text-2xl font-mono font-bold">{household?.invite_code}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Partagez ce code pour inviter de nouveaux membres
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Créé le</p>
              <p className="text-lg">
                {household?.created_at
                  ? new Date(household.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Points pour récompense</p>
              <p className="text-lg font-bold">{household?.points_to_reward || 500} points</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members && members.length > 0 ? (
                members.map((member: any, index: number) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.profiles?.display_name || member.profiles?.username || 'Utilisateur'}
                          {member.role === 'admin' && ' 👑'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.tasks_completed_in_household || 0} tâche{(member.tasks_completed_in_household || 0) > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{member.points_in_household || 0}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Aucun membre pour le moment
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membres du foyer ({members?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members && members.length > 0 ? (
              members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">
                      {member.profiles?.display_name || member.profiles?.username || 'Utilisateur'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.profiles?.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {member.role === 'admin' ? '👑 Admin' : '👤 Membre'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rejoint le {new Date(member.joined_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Aucun membre pour le moment
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
