'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface Task {
  id: string
  household_id: string
  custom_points: number
  is_active: boolean
  task_templates: {
    id: string
    name: string
    tip: string | null
    base_points: number
    duration_minutes: number
    categories: {
      name: string
      emoji: string
    }
  }
}

interface TaskListProps {
  tasks: Task[]
  householdId: string
  userId: string
  onTaskCompleted?: (task: Task, points: number) => void
}

export function TaskList({ tasks, householdId, userId, onTaskCompleted }: TaskListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleCompleteTask = async (task: Task) => {
    setCompletingTaskId(task.id)

    try {
      // 1. Créer l'entrée dans task_history
      const { error: historyError } = await supabase
        .from('task_history')
        .insert({
          household_task_id: task.id,
          profile_id: userId,
          household_id: householdId,
          points_earned: task.custom_points,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (historyError) {
        console.error('Erreur lors de la création de l\'historique:', historyError)
        setCompletingTaskId(null)
        return
      }

      // 2. Mettre à jour les statistiques du profil
      const { error: profileError } = await supabase.rpc('increment_profile_stats', {
        p_profile_id: userId,
        p_points: task.custom_points,
      })

      if (profileError) {
        console.error('Erreur lors de la mise à jour du profil:', profileError)
      }

      // 3. Mettre à jour les statistiques du membre du foyer
      const { error: memberError } = await supabase.rpc('increment_household_member_stats', {
        p_profile_id: userId,
        p_household_id: householdId,
        p_points: task.custom_points,
      })

      if (memberError) {
        console.error('Erreur lors de la mise à jour du membre:', memberError)
      }

      // Appeler le callback pour afficher la modal de célébration
      if (onTaskCompleted) {
        onTaskCompleted(task, task.custom_points)
      }

      // Rafraîchir la page pour afficher les nouvelles stats
      router.refresh()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setCompletingTaskId(null)
    }
  }

  // Grouper les tâches par catégorie
  const tasksByCategory = tasks.reduce((acc, task) => {
    const categoryName = task.task_templates.categories.name
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  return (
    <div className="space-y-4">
      {Object.entries(tasksByCategory).map(([categoryName, categoryTasks]) => (
        <div key={categoryName} className="border-4 border-black bg-off-white shadow-brutal overflow-hidden">
          <GrainOverlay />

          {/* Category Header */}
          <div className="relative z-10 p-4 border-b-4 border-black bg-orange flex items-center gap-4">
            <CategoryIcon category={categoryName} size={48} />
            <div className="flex-1">
              <h3 className="font-anton text-xl uppercase">{categoryName}</h3>
              <p className="font-space-mono text-xs opacity-70">
                {categoryTasks.length} tâche{categoryTasks.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Task List */}
          <div className="relative z-10 p-4 space-y-3">
            {categoryTasks.map((task) => (
              <div
                key={task.id}
                onMouseEnter={() => setHoveredId(task.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "flex items-center border-3 border-black bg-cream transition-all cursor-pointer overflow-hidden",
                  hoveredId === task.id && "translate-x-2 shadow-brutal-sm"
                )}
              >
                {/* Icon */}
                <div className="w-20 h-20 border-r-3 border-black bg-black/5 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon category={categoryName} size={40} />
                </div>

                {/* Info */}
                <div className="flex-1 p-4">
                  <h4 className="font-anton text-lg uppercase">
                    {task.task_templates.name}
                  </h4>
                  {task.task_templates.tip && (
                    <p className="font-outfit text-sm opacity-70 mt-1">
                      {task.task_templates.tip}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 font-space-mono text-xs opacity-60">
                    <span>⭐ {task.custom_points} pts</span>
                    {task.task_templates.duration_minutes && (
                      <span>⏱️ ~{task.task_templates.duration_minutes} min</span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleCompleteTask(task)}
                    disabled={completingTaskId === task.id}
                  >
                    {completingTaskId === task.id ? 'EN COURS...' : 'COMPLÉTER'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
