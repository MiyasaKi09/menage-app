import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
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
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-b from-deep-purple to-deep-blue transition-colors duration-700" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase mb-1">
              {householdName}
            </p>
            <h1 className="font-cinzel text-3xl md:text-4xl text-cream font-semibold tracking-tight">
              Quetes
            </h1>
            <p className="font-medieval text-[12px] text-cream/30 mt-1">
              {taskCount} disponible{taskCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/tasks/schedule">
              <Button variant="ghost" size="sm" className="text-cream/30 hover:text-cream/60">Planning</Button>
            </Link>
            <Link href="/tasks/history">
              <Button variant="ghost" size="sm" className="text-cream/30 hover:text-cream/60">Historique</Button>
            </Link>
          </div>
        </div>

        {/* Tasks */}
        {tasksError && (
          <div className="rounded-2xl bg-red/[0.06] border border-red/10 p-6">
            <p className="font-cinzel text-[15px] text-cream/70 mb-2">Erreur de chargement</p>
            <pre className="text-[12px] text-cream/30 overflow-auto">{JSON.stringify(tasksError, null, 2)}</pre>
          </div>
        )}
        {!tasksError && (!tasks || tasks.length === 0) ? (
          <div className="text-center py-16">
            <div className="text-3xl opacity-30 mb-3">📜</div>
            <p className="font-cinzel text-[15px] text-cream/50">Aucune quete disponible</p>
            <p className="font-lora text-[13px] text-cream/25 mt-1">Les quetes seront bientot configurees</p>
          </div>
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
