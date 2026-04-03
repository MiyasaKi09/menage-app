import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function TaskHistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer l'historique des tâches de l'utilisateur
  // On utilise task_name et category_name stockés directement dans task_history
  const { data: history } = await supabase
    .from('task_history')
    .select(`
      id,
      completed_at,
      points_earned,
      task_name,
      category_name,
      households (
        name
      )
    `)
    .eq('profile_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/tasks" className="text-sm text-muted-foreground hover:underline mb-2 block">
            ← Retour aux tâches
          </Link>
          <h1 className="text-3xl font-serif font-bold">Historique des Quetes</h1>
          <p className="text-muted-foreground">
            Les 50 dernières tâches complétées
          </p>
        </div>
      </div>

      {!history || history.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune tâche complétée</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore complété de tâche. Commencez dès maintenant !
            </p>
            <Link href="/tasks">
              <Button>Voir les tâches disponibles</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {history.map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">📋</div>
                    <div>
                      <p className="font-medium">
                        {entry.task_name || 'Tâche'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {entry.category_name && <span>{entry.category_name}</span>}
                        {entry.households?.name && <span>🏠 {entry.households.name}</span>}
                        <span>
                          {new Date(entry.completed_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +{entry.points_earned}
                    </p>
                    <p className="text-xs text-muted-foreground">or</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
