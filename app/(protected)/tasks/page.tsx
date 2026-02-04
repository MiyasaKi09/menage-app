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

  // Récupérer les tâches du foyer
  const { data: tasks } = await supabase
    .from('household_tasks')
    .select(`
      id,
      household_id,
      custom_points,
      is_active,
      task_templates (
        id,
        name,
        tip,
        base_points,
        duration_minutes,
        categories (
          name,
          emoji
        )
      )
    `)
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('task_templates(name)')

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
          <Link href="/tasks/history">
            <Button variant="outline" size="sm">Voir l'historique</Button>
          </Link>
        </div>

        {/* Tasks */}
        {!tasks || tasks.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucune tâche disponible</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-outfit opacity-70">
                Aucune tâche n'a été configurée pour ce foyer. Les tâches seront bientôt disponibles.
              </p>
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
