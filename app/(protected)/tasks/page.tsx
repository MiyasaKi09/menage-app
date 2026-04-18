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

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError)
  }

  const taskCount = tasks?.length || 0

  return (
    <div className="min-h-screen relative bg-background">
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden px-5 py-5" style={{
          background: 'linear-gradient(135deg, rgb(var(--primary)/0.08) 0%, transparent 100%)',
          border: '1px solid rgb(var(--primary)/0.12)',
        }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-sans text-[10px] tracking-widest uppercase mb-1"
                style={{ color: 'rgb(var(--primary)/0.55)' }}>
                {householdName}
              </p>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                Quêtes
              </h1>
              <p className="font-sans text-[12px] text-foreground/30 mt-0.5">
                {taskCount} disponible{taskCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end pt-0.5">
              <Link href="/tasks/schedule">
                <Button variant="ghost" size="sm" className="text-foreground/35 hover:text-foreground/65 text-[12px]">Planning</Button>
              </Link>
              <Link href="/tasks/history">
                <Button variant="ghost" size="sm" className="text-foreground/35 hover:text-foreground/65 text-[12px]">Historique</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tasks */}
        {tasksError && (
          <div className="rounded-2xl bg-red/[0.06] border border-red/10 p-6">
            <p className="font-sans font-semibold text-[15px] text-foreground/70 mb-2">Erreur de chargement</p>
            <pre className="text-[12px] text-foreground/30 overflow-auto">{JSON.stringify(tasksError, null, 2)}</pre>
          </div>
        )}
        {!tasksError && (!tasks || tasks.length === 0) ? (
          <div className="text-center py-16">
            <div className="text-3xl opacity-30 mb-3">📜</div>
            <p className="font-sans font-semibold text-[15px] text-foreground/50">Aucune quete disponible</p>
            <p className="font-sans text-[13px] text-foreground/25 mt-1">Les quetes seront bientot configurees</p>
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
