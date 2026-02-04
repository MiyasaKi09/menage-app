'use client'

import { useState } from 'react'
import { TaskList } from './TaskList'
import { TaskCompletionModal } from './TaskCompletionModal'

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

interface TasksPageClientProps {
  tasks: Task[]
  householdId: string
  userId: string
}

export function TasksPageClient({ tasks, householdId, userId }: TasksPageClientProps) {
  const [completedTask, setCompletedTask] = useState<{ name: string; points: number } | null>(null)

  const handleTaskCompleted = (task: Task, points: number) => {
    setCompletedTask({
      name: task.task_templates.name,
      points,
    })
  }

  const handleCloseModal = () => {
    setCompletedTask(null)
  }

  return (
    <>
      <TaskList
        tasks={tasks}
        householdId={householdId}
        userId={userId}
        onTaskCompleted={handleTaskCompleted}
      />

      {completedTask && (
        <TaskCompletionModal
          taskName={completedTask.name}
          points={completedTask.points}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
