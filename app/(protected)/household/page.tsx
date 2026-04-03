import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function HouseholdPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold">Ma Cite</h1>
          <p className="text-muted-foreground">
            Gerez votre cite et invitez des membres
          </p>
        </div>
        {(!memberships || memberships.length === 0) && (
          <Link href="/household/setup">
            <Button>Fonder ou rejoindre une cite</Button>
          </Link>
        )}
      </div>

      {!memberships || memberships.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune cite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous ne faites partie d&apos;aucune cite. Fondez-en une ou rejoignez une cite existante avec un code d&apos;invitation.
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
                    <CardTitle>{membership.households?.name || 'Cite'}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {membership.role === 'admin' ? '👑 Administrateur' : '👤 Membre'}
                    </p>
                  </div>
                  <Link href={`/household/${membership.households?.id}`}>
                    <Button variant="outline" size="sm">Voir les details</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Code d&apos;invitation</p>
                    <p className="text-lg font-sans font-bold">{membership.households?.invite_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Or</p>
                    <p className="text-lg font-bold">{membership.points_in_household || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quetes accomplies</p>
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
                Vous voulez rejoindre une autre cite ?
              </p>
              <Link href="/household/setup">
                <Button variant="outline">Rejoindre une cite</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
