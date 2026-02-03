import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Récupérer les données du profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Récupérer les foyers de l'utilisateur
  const { data: households } = await supabase
    .from('household_members')
    .select(`
      id,
      points_in_household,
      tasks_completed_in_household,
      households (
        id,
        name
      )
    `)
    .eq('profile_id', user?.id)
    .limit(3)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenue{profile?.display_name ? `, ${profile.display_name}` : ''} ! 👋
        </h1>
        <p className="text-muted-foreground">
          Voici votre tableau de bord
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Points Totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{profile?.total_points || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Tous foyers confondus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tâches Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{profile?.tasks_completed || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Au total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Niveau</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{profile?.current_level || 1}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {profile?.current_streak || 0} jour{(profile?.current_streak || 0) > 1 ? 's' : ''} de série 🔥
            </p>
          </CardContent>
        </Card>
      </div>

      {households && households.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Mes Foyers</CardTitle>
              <Link href="/household">
                <Button variant="outline" size="sm">Voir tout</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {households.map((membership: any) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{membership.households?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {membership.tasks_completed_in_household || 0} tâche{(membership.tasks_completed_in_household || 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{membership.points_in_household || 0}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="py-8 text-center">
            <p className="text-lg font-medium mb-2">Aucun foyer</p>
            <p className="text-muted-foreground mb-4">
              Créez ou rejoignez un foyer pour commencer à partager les tâches
            </p>
            <Link href="/household/setup">
              <Button>Créer ou rejoindre un foyer</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Prochaines étapes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(!households || households.length === 0) && (
            <p className="text-sm text-muted-foreground">
              🏠 <Link href="/household/setup" className="underline">Créez ou rejoignez un foyer</Link>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            📝 <Link href="/questionnaire" className="underline">Complétez le questionnaire initial</Link>
          </p>
          <p className="text-sm text-muted-foreground">
            ✅ Commencez à accomplir des tâches
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
