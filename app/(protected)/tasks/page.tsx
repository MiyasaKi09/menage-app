import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { TaskList } from '@/components/tasks/TaskList'

export default async function TasksPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer les foyers de l'utilisateur
  const { data: memberships } = await supabase
    .from('household_members')
    .select(`
      household_id,
      households (
        id,
        name
      )
    `)
    .eq('profile_id', user.id)

  // Si l'utilisateur n'a pas de foyer, rediriger
  if (!memberships || memberships.length === 0) {
    redirect('/household/setup')
  }

  // Utiliser le premier foyer par défaut pour la v1
  const householdId = memberships[0].household_id
  const householdName = (memberships[0].households as any)?.name

  // Récupérer les tâches du foyer
  const { data: tasks } = await supabase
    .from('household_tasks')
    .select(`
      id,
      household_id,
      points_value,
      is_active,
      task_templates (
        id,
        name,
        description,
        default_points,
        estimated_duration,
        categories (
          name,
          icon
        )
      )
    `)
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('task_templates(name)')

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Tâches</h1>
          <p className="text-muted-foreground">
            {householdName} - {tasks?.length || 0} tâche{(tasks?.length || 0) > 1 ? 's' : ''} disponible{(tasks?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/tasks/history">
          <Button variant="outline" size="sm">Voir l'historique</Button>
        </Link>
      </div>

      {!tasks || tasks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune tâche disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aucune tâche n'a été configurée pour ce foyer. Les tâches seront bientôt disponibles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <TaskList tasks={tasks as any} householdId={householdId} userId={user.id} />
      )}
    </div>
  )
}
