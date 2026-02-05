import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DiagonalStripe } from '@/components/ui/DiagonalStripe'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import Link from 'next/link'
import { TasksPageClient } from '@/components/tasks/TasksPageClient'

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

  // Récupérer les tâches du foyer avec leurs catégories via RPC
  const { data: rawTasks, error: tasksError } = await supabase
    .rpc('get_household_tasks_with_details', { p_household_id: householdId })

  // Transform the flat result into nested structure for compatibility
  const tasks = rawTasks?.map((task: {
    id: string
    household_id: string
    custom_points: number | null
    is_active: boolean
    template_id: string
    template_name: string
    template_tip: string | null
    template_base_points: number
    template_duration_minutes: number
    category_name: string
    category_emoji: string
  }) => ({
    id: task.id,
    household_id: task.household_id,
    custom_points: task.custom_points,
    is_active: task.is_active,
    task_templates: {
      id: task.template_id,
      name: task.template_name,
      tip: task.template_tip,
      base_points: task.template_base_points,
      duration_minutes: task.template_duration_minutes,
      categories: {
        name: task.category_name,
        emoji: task.category_emoji
      }
    }
  }))

  // Log pour debug
  if (tasksError) {
    console.error('Error fetching tasks:', tasksError)
    console.error('Error details:', JSON.stringify(tasksError, null, 2))
  }
  console.log('Tasks fetched:', tasks?.length || 0, 'tasks')
  console.log('Sample task:', JSON.stringify(tasks?.[0], null, 2))
  console.log('All tasks:', JSON.stringify(tasks, null, 2))

  const taskCount = tasks?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-purple to-[#1f0833] relative overflow-hidden">
      <GrainOverlay />
      <DiagonalStripe position="top-left" colors={['#ffe14f', '#ff6b2c', '#00b4ff']} />

      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="font-space-mono text-xs opacity-50 uppercase tracking-wider mb-1 text-cream">
              {householdName}
            </div>
            <h1 className="font-anton text-4xl md:text-5xl text-cream uppercase leading-none">
              TÂCHES
            </h1>
            <p className="font-space-mono text-sm text-cream opacity-60 mt-2">
              {taskCount} tâche{taskCount > 1 ? 's' : ''} disponible{taskCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/tasks/schedule">
              <Button variant="outline" size="sm">Vue Planning</Button>
            </Link>
            <Link href="/tasks/history">
              <Button variant="outline" size="sm">Historique</Button>
            </Link>
          </div>
        </div>

        {/* Tasks */}
        {tasksError && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red">Erreur de chargement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-outfit opacity-70 mb-2">
                Une erreur s'est produite lors du chargement des tâches:
              </p>
              <pre className="text-xs bg-black/20 p-4 rounded overflow-auto">
                {JSON.stringify(tasksError, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
        {!tasksError && (!tasks || tasks.length === 0) ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucune tâche disponible</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-outfit opacity-70">
                Aucune tâche n'a été configurée pour ce foyer. Les tâches seront bientôt disponibles.
              </p>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm opacity-60">Debug info</summary>
                <pre className="text-xs bg-black/20 p-4 rounded overflow-auto mt-2">
                  Household ID: {householdId}
                  {'\n'}Tasks count: {tasks?.length || 0}
                  {'\n'}Raw data: {JSON.stringify(tasks, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        ) : (
          <TasksPageClient
            tasks={tasks as any}
            householdId={householdId}
            userId={user.id}
          />
        )}
      </div>
    </div>
  )
}
