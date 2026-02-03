import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function HouseholdPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer les foyers de l'utilisateur
  const { data: memberships } = await supabase
    .from('household_members')
    .select(`
      id,
      role,
      joined_at,
      points_in_household,
      tasks_completed_in_household,
      households (
        id,
        name,
        invite_code,
        created_at
      )
    `)
    .eq('profile_id', user.id)

  // Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mes Foyers</h1>
          <p className="text-muted-foreground">
            Gérez vos foyers et invitez des membres
          </p>
        </div>
        {(!memberships || memberships.length === 0) && (
          <Link href="/household/setup">
            <Button>Créer ou rejoindre un foyer</Button>
          </Link>
        )}
      </div>

      {!memberships || memberships.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun foyer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous ne faites partie d'aucun foyer. Créez-en un ou rejoignez un foyer existant avec un code d'invitation.
            </p>
            <Link href="/household/setup">
              <Button>Commencer</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {memberships.map((membership: any) => (
            <Card key={membership.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{membership.households?.name || 'Foyer'}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {membership.role === 'admin' ? '👑 Administrateur' : '👤 Membre'}
                    </p>
                  </div>
                  <Link href={`/household/${membership.households?.id}`}>
                    <Button variant="outline" size="sm">Voir les détails</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Code d'invitation</p>
                    <p className="text-lg font-mono font-bold">{membership.households?.invite_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Points</p>
                    <p className="text-lg font-bold">{membership.points_in_household || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tâches complétées</p>
                    <p className="text-lg font-bold">{membership.tasks_completed_in_household || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Membre depuis</p>
                    <p className="text-lg font-bold">
                      {new Date(membership.joined_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Vous voulez rejoindre un autre foyer ?
              </p>
              <Link href="/household/setup">
                <Button variant="outline">Rejoindre un foyer</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
