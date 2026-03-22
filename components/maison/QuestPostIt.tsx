'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface QuestTask {
  task_id: string
  task_name: string
  category_emoji: string
  category_name: string
  points: number
  status: string
  scheduled_date: string
  household_task_id: string
}

interface QuestPostItProps {
  // All scheduled instances of this quest for the week, grouped by household_task_id
  questName: string
  categoryEmoji: string
  categoryName: string
  steps: QuestTask[]
  totalPoints: number
}

export function QuestPostIt({ questName, categoryEmoji, steps, totalPoints }: QuestPostItProps) {
  const supabase = createClient()
  const router = useRouter()
  const [localSteps, setLocalSteps] = useState(steps)

  const completedCount = localSteps.filter(s => s.status === 'completed').length
  const totalSteps = localSteps.length
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0

  const handleCompleteStep = async (taskId: string) => {
    await supabase
      .from('scheduled_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId)

    setLocalSteps(prev =>
      prev.map(s => s.task_id === taskId ? { ...s, status: 'completed' } : s)
    )
    router.refresh()
  }

  return (
    <div className="w-[220px] bg-yellow/[0.06] border border-yellow/[0.12] rounded-xl p-4 space-y-3 relative overflow-hidden">
      {/* Post-it fold effect */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-yellow/[0.08] rounded-bl-lg" />

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{categoryEmoji}</span>
          <span className="font-medieval text-[10px] text-cream/25 tracking-widest uppercase">Quete</span>
        </div>
        <h3 className="font-cinzel text-[13px] text-cream/80 leading-tight pr-4">
          {questName}
        </h3>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medieval text-[10px] text-cream/25">{completedCount}/{totalSteps} etapes</span>
          <span className="font-cinzel text-[11px] text-yellow/50">{totalPoints} or</span>
        </div>
        <div className="h-1.5 bg-cream/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-yellow/40 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Steps checklist */}
      <div className="space-y-1.5">
        {localSteps.map((step) => {
          const isCompleted = step.status === 'completed'
          const dayLabel = new Date(step.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'short' })

          return (
            <button
              key={step.task_id}
              onClick={() => !isCompleted && handleCompleteStep(step.task_id)}
              disabled={isCompleted}
              className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-colors ${
                isCompleted
                  ? 'bg-green/[0.06]'
                  : 'hover:bg-cream/[0.04]'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                isCompleted
                  ? 'bg-green/20 border-green/30'
                  : 'border-cream/15 hover:border-cream/25'
              }`}>
                {isCompleted && <Check size={10} className="text-green/70" />}
              </div>
              <span className={`font-lora text-[11px] flex-1 ${
                isCompleted ? 'text-cream/30 line-through' : 'text-cream/50'
              }`}>
                {dayLabel}
              </span>
              <span className={`font-medieval text-[9px] ${
                isCompleted ? 'text-green/40' : 'text-cream/15'
              }`}>
                +{step.points}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
