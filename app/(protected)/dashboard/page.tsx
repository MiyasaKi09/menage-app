import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

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
            <CardTitle className="text-lg">Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{profile?.total_points || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tâches complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{profile?.tasks_completed || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Niveau</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{profile?.current_level || 1}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prochaines étapes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            📝 Complétez le questionnaire initial pour personnaliser votre expérience
          </p>
          <p className="text-sm text-muted-foreground">
            🏠 Créez ou rejoignez un foyer
          </p>
          <p className="text-sm text-muted-foreground">
            ✅ Commencez à accomplir des tâches
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
