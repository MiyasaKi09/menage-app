'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface Task {
  id: string
  household_id: string
  points_value: number
  is_active: boolean
  task_templates: {
    id: string
    name: string
    description: string | null
    default_points: number
    estimated_duration: number | null
    categories: {
      name: string
      icon: string | null
    }
  }
}

interface TaskListProps {
  tasks: Task[]
  householdId: string
  userId: string
}

export function TaskList({ tasks, householdId, userId }: TaskListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)

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
          points_earned: task.points_value,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (historyError) {
        console.error('Erreur lors de la création de l\'historique:', historyError)
        alert('Erreur lors de la complétion de la tâche')
        setCompletingTaskId(null)
        return
      }

      // 2. Mettre à jour les statistiques du profil
      const { error: profileError } = await supabase.rpc('increment_profile_stats', {
        p_profile_id: userId,
        p_points: task.points_value,
      })

      if (profileError) {
        console.error('Erreur lors de la mise à jour du profil:', profileError)
      }

      // 3. Mettre à jour les statistiques du membre du foyer
      const { error: memberError } = await supabase.rpc('increment_household_member_stats', {
        p_profile_id: userId,
        p_household_id: householdId,
        p_points: task.points_value,
      })

      if (memberError) {
        console.error('Erreur lors de la mise à jour du membre:', memberError)
      }

      // Rafraîchir la page pour afficher les nouvelles stats
      router.refresh()

      alert(`✅ Tâche complétée ! +${task.points_value} points`)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la complétion de la tâche')
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
    <div className="space-y-6">
      {Object.entries(tasksByCategory).map(([categoryName, categoryTasks]) => (
        <Card key={categoryName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{categoryTasks[0].task_templates.categories.icon || '📋'}</span>
              <span>{categoryName}</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({categoryTasks.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{task.task_templates.name}</h3>
                    {task.task_templates.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.task_templates.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>⭐ {task.points_value} points</span>
                      {task.task_templates.estimated_duration && (
                        <span>⏱️ ~{task.task_templates.estimated_duration} min</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCompleteTask(task)}
                    disabled={completingTaskId === task.id}
                    size="sm"
                  >
                    {completingTaskId === task.id ? 'En cours...' : 'Compléter'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
