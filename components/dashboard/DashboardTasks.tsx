'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { useCharacterTheme } from '@/components/providers/CharacterThemeProvider'
import { calculateBonusPoints } from '@/lib/characters/apply-power'

interface ScheduledTask {
  task_id: string  // This is actually scheduled_tasks.id from the RPC
  task_name: string
  category_name: string
  category_emoji: string
  duration_minutes: number
  points: number
  status: string
  template_id?: string  // Optional - may not be returned by RPC
}

interface DashboardTasksProps {
  tasks: ScheduledTask[]
  householdId: string
  userId: string
}

export function DashboardTasks({ tasks, householdId, userId }: DashboardTasksProps) {
  const router = useRouter()
  const supabase = createClient()
  const { power } = useCharacterTheme()
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [localTasks, setLocalTasks] = useState(tasks)

  const completedCount = localTasks.filter(t => t.status === 'completed').length
  const totalCount = localTasks.length
  const pendingTasks = localTasks.filter(t => t.status !== 'completed')

  const handleCompleteTask = async (task: ScheduledTask) => {
    if (task.status === 'completed') return

    // task_id from RPC is actually scheduled_tasks.id
    const scheduledTaskId = task.task_id
    setCompletingTaskId(scheduledTaskId)

    try {
      const now = new Date()

      // Calculate points with character power bonus
      const { finalPoints } = calculateBonusPoints(task.points, task.category_name, power)

      // 1. Mettre a jour scheduled_tasks.status
      const { data: updateData, error: scheduleError } = await supabase
        .from('scheduled_tasks')
        .update({
          status: 'completed',
          completed_at: now.toISOString()
        })
        .eq('id', scheduledTaskId)
        .select()

      if (scheduleError) {
        console.error('Erreur scheduled_tasks:', scheduleError)
        alert(`Erreur: ${scheduleError.message}`)
        setCompletingTaskId(null)
        return
      }

      if (!updateData || updateData.length === 0) {
        console.error('Aucune ligne mise à jour - vérifiez les permissions RLS')
        alert('Erreur: Impossible de mettre à jour la tâche. Vérifiez les permissions.')
        setCompletingTaskId(null)
        return
      }

      // 2. Creer l'entree dans task_history
      const historyData: Record<string, any> = {
        scheduled_task_id: scheduledTaskId,
        household_id: householdId,
        profile_id: userId,
        task_name: task.task_name,
        category_name: task.category_name,
        points_earned: finalPoints,
        completed_at: now.toISOString(),
        day_of_week: now.getDay(),
        hour_of_day: now.getHours(),
      }
      // Only add template_id if available
      if (task.template_id) {
        historyData.task_template_id = task.template_id
      }

      const { error: historyError } = await supabase
        .from('task_history')
        .insert(historyData)
        .select()
        .single()

      if (historyError) {
        console.error('Erreur task_history:', historyError)
        // Continue anyway, the main update worked
      }

      // 3. Mettre a jour les statistiques du profil
      const { error: profileError } = await supabase.rpc('increment_profile_stats', {
        p_profile_id: userId,
        p_points: finalPoints,
      })

      if (profileError) {
        console.error('Erreur increment_profile_stats:', profileError)
        // Non-bloquant, on continue
      }

      // 4. Mettre a jour les statistiques du membre du foyer
      const { error: memberError } = await supabase.rpc('increment_household_member_stats', {
        p_profile_id: userId,
        p_household_id: householdId,
        p_points: finalPoints,
      })

      if (memberError) {
        console.error('Erreur increment_household_member_stats:', memberError)
        // Non-bloquant, on continue
      }

      // Mettre a jour l'etat local immediatement
      setLocalTasks(prev =>
        prev.map(t =>
          t.task_id === scheduledTaskId
            ? { ...t, status: 'completed' }
            : t
        )
      )

      // Rafraichir la page pour les stats globales
      router.refresh()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setCompletingTaskId(null)
    }
  }

  if (totalCount === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-orange/20 to-yellow/10 border-b border-charcoal/10">
        <div className="flex justify-between items-center">
          <CardTitle className="font-cinzel text-2xl font-bold">Quetes du jour</CardTitle>
          <span className="font-medieval text-sm bg-charcoal text-cream px-3 py-1 rounded-md">
            {completedCount}/{totalCount}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-4xl">🏆</span>
            <p className="font-cinzel text-xl font-bold mt-2">Victoire !</p>
            <p className="font-lora text-sm opacity-70">
              Toutes les quetes du jour sont accomplies
            </p>
          </div>
        ) : (
          pendingTasks.slice(0, 5).map((task) => (
            <div
              key={task.task_id}
              className="flex items-center justify-between p-3 border border-charcoal/8 bg-cream rounded-md hover:bg-yellow/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{task.category_emoji || '📋'}</span>
                <div>
                  <p className="font-cinzel text-sm font-semibold">{task.task_name}</p>
                  <p className="font-medieval text-xs opacity-60">
                    {task.duration_minutes} min - {task.points} or
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleCompleteTask(task)}
                disabled={completingTaskId === task.task_id}
              >
                {completingTaskId === task.task_id ? '...' : 'Accompli'}
              </Button>
            </div>
          ))
        )}
        <Link href="/tasks/schedule">
          <Button variant="outline" className="w-full mt-4">
            Voir le grimoire complet
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
