'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCharacterTheme } from '@/components/providers/CharacterThemeProvider'
import { calculateBonusPoints } from '@/lib/characters/apply-power'

interface ScheduledTask {
  task_id: string
  task_name: string
  category_name: string
  category_emoji: string
  duration_minutes: number
  points: number
  status: string
  template_id?: string
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
    const scheduledTaskId = task.task_id
    setCompletingTaskId(scheduledTaskId)

    try {
      const now = new Date()
      const { finalPoints } = calculateBonusPoints(task.points, task.category_name, power)

      const { data: updateData, error: scheduleError } = await supabase
        .from('scheduled_tasks')
        .update({ status: 'completed', completed_at: now.toISOString() })
        .eq('id', scheduledTaskId)
        .select()

      if (scheduleError || !updateData?.length) {
        setCompletingTaskId(null)
        return
      }

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
      if (task.template_id) historyData.task_template_id = task.template_id

      await supabase.from('task_history').insert(historyData).select().single()
      await supabase.rpc('increment_profile_stats', { p_profile_id: userId, p_points: finalPoints })
      await supabase.rpc('increment_household_member_stats', { p_profile_id: userId, p_household_id: householdId, p_points: finalPoints })

      setLocalTasks(prev => prev.map(t => t.task_id === scheduledTaskId ? { ...t, status: 'completed' } : t))
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setCompletingTaskId(null)
    }
  }

  if (totalCount === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
          Quetes du jour
        </p>
        <p className="font-medieval text-[11px] text-cream/20">
          {completedCount}/{totalCount}
        </p>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-3xl mb-2 opacity-50">🏆</div>
          <p className="font-cinzel text-[15px] text-cream/60">Toutes les quetes sont accomplies</p>
        </div>
      ) : (
        pendingTasks.slice(0, 5).map((task) => (
          <div
            key={task.task_id}
            className="flex items-center justify-between py-3 border-b border-cream/[0.06] last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg flex-shrink-0 opacity-60">{task.category_emoji || '📋'}</span>
              <div className="min-w-0">
                <p className="font-cinzel text-[14px] text-cream/70 truncate">{task.task_name}</p>
                <p className="font-medieval text-[11px] text-cream/20">
                  {task.duration_minutes}min · {task.points} or
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCompleteTask(task)}
              disabled={completingTaskId === task.task_id}
              className="flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-[12px] font-cinzel text-cream/40 hover:text-cream hover:bg-cream/[0.06] transition-all duration-200 disabled:opacity-30"
            >
              {completingTaskId === task.task_id ? '...' : 'Fait'}
            </button>
          </div>
        ))
      )}

      <Link href="/tasks/schedule" className="block pt-2">
        <p className="text-center font-medieval text-[11px] text-cream/15 hover:text-cream/30 transition-colors duration-200">
          Voir le planning
        </p>
      </Link>
    </div>
  )
}
