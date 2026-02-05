'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface ScheduleTaskCardProps {
  task: {
    task_id: string
    task_name: string
    task_tip: string | null
    category_name: string
    category_emoji: string
    duration_minutes: number
    points: number
    status: 'pending' | 'in_progress' | 'completed' | 'skipped'
    assigned_to_id: string | null
    assigned_to_name: string | null
    rollover_count: number
  }
  householdId: string
  userId: string
}

export function ScheduleTaskCard({ task, householdId, userId }: ScheduleTaskCardProps) {
  const [completing, setCompleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleComplete = async () => {
    setCompleting(true)

    try {
      const completedAt = new Date().toISOString()

      // 1. Update scheduled_task status to 'completed'
      const { error: updateError } = await supabase
        .from('scheduled_tasks')
        .update({
          status: 'completed',
          completed_at: completedAt,
          completed_by: userId,
          points_earned: task.points
        })
        .eq('id', task.task_id)

      if (updateError) {
        console.error('Error updating scheduled task:', updateError)
        alert('Erreur lors de la complétion de la tâche')
        setCompleting(false)
        return
      }

      // 2. Create task_history entry
      const { error: historyError } = await supabase
        .from('task_history')
        .insert({
          scheduled_task_id: task.task_id,
          household_id: householdId,
          profile_id: userId,
          task_name: task.task_name,
          category_name: task.category_name,
          points_earned: task.points,
          completed_at: completedAt,
          day_of_week: new Date().getDay(),
          hour_of_day: new Date().getHours()
        })

      if (historyError) {
        console.error('Error creating history:', historyError)
        // Non-blocking - continue
      }

      // 3. Update user stats (total points and tasks completed)
      const { error: statsError } = await supabase.rpc('increment_profile_stats', {
        p_profile_id: userId,
        p_points: task.points
      })

      if (statsError) {
        console.error('Error updating profile stats:', statsError)
        // Non-blocking - continue
      }

      // 4. Update household member stats
      const { error: memberStatsError } = await supabase.rpc('increment_household_member_stats', {
        p_profile_id: userId,
        p_household_id: householdId,
        p_points: task.points
      })

      if (memberStatsError) {
        console.error('Error updating member stats:', memberStatsError)
        // Non-blocking - continue
      }

      // 5. Refresh the page to show updated status
      router.refresh()
    } catch (error) {
      console.error('Unexpected error completing task:', error)
      alert('Erreur inattendue')
      setCompleting(false)
    }
  }

  const isCompleted = task.status === 'completed'
  const isSkipped = task.status === 'skipped'

  return (
    <div
      className={cn(
        'flex items-center border-4 border-black bg-cream transition-all shadow-brutal-sm hover:shadow-brutal',
        isCompleted && 'opacity-60 bg-green/10',
        isSkipped && 'opacity-40 bg-charcoal/5'
      )}
    >
      {/* Category Icon */}
      <div className="w-20 h-20 border-r-4 border-black bg-black/5 flex items-center justify-center flex-shrink-0">
        <span className="text-4xl">{task.category_emoji}</span>
      </div>

      {/* Task Info */}
      <div className="flex-1 p-4 min-w-0">
        <h4 className="font-anton text-lg uppercase leading-tight truncate">
          {task.task_name}
        </h4>

        {task.task_tip && !isCompleted && (
          <p className="font-outfit text-xs opacity-60 mt-1 line-clamp-2">
            💡 {task.task_tip}
          </p>
        )}

        <div className="flex gap-4 mt-2 font-space-mono text-xs opacity-70 flex-wrap">
          <span>⭐ {task.points} pts</span>
          <span>⏱️ {task.duration_minutes} min</span>
          <span className="opacity-50">{task.category_name}</span>
          {task.assigned_to_name && <span>👤 {task.assigned_to_name}</span>}
          {task.rollover_count > 0 && (
            <span className="text-orange">🔄 Reporté x{task.rollover_count}</span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 flex-shrink-0">
        {isCompleted ? (
          <div className="font-space-mono text-sm text-green bg-green/10 px-4 py-2 border-3 border-green">
            ✓ FAIT
          </div>
        ) : isSkipped ? (
          <div className="font-space-mono text-sm text-charcoal/50 px-4 py-2">
            SAUTÉ
          </div>
        ) : (
          <Button
            size="sm"
            onClick={handleComplete}
            disabled={completing}
            className="min-w-[120px]"
          >
            {completing ? 'EN COURS...' : 'COMPLÉTER'}
          </Button>
        )}
      </div>
    </div>
  )
}
