'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface QuestStep {
  task_id: string
  points: number
  status: string
  scheduled_date: string
}

interface QuestPathProps {
  questName: string
  categoryEmoji: string
  steps: QuestStep[]
  totalPoints: number
}

export function QuestPath({ questName, categoryEmoji, steps, totalPoints }: QuestPathProps) {
  const supabase = createClient()
  const router = useRouter()
  const [localSteps, setLocalSteps] = useState(steps)

  const completedCount = localSteps.filter(s => s.status === 'completed').length

  const handleComplete = async (taskId: string) => {
    await supabase
      .from('scheduled_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId)

    setLocalSteps(prev =>
      prev.map(s => s.task_id === taskId ? { ...s, status: 'completed' } : s)
    )
    router.refresh()
  }

  // Determine step state: completed, current (first pending), or future
  const firstPendingIndex = localSteps.findIndex(s => s.status !== 'completed' && s.status !== 'skipped')

  return (
    <div className="bg-cream/[0.03] border border-cream/[0.06] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{categoryEmoji}</span>
          <h3 className="font-cinzel text-[13px] text-cream/80">{questName}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medieval text-[10px] text-cream/25">{completedCount}/{localSteps.length}</span>
          <span className="font-cinzel text-[11px] text-yellow/50">{totalPoints} or</span>
        </div>
      </div>

      {/* Treasure map path */}
      <div className="flex items-center w-full py-2">
        {localSteps.map((step, i) => {
          const isCompleted = step.status === 'completed' || step.status === 'skipped'
          const isCurrent = i === firstPendingIndex
          const dayLabel = new Date(step.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'short' })

          return (
            <div key={step.task_id} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => isCurrent && handleComplete(step.task_id)}
                  disabled={!isCurrent}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      scale: isCurrent ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      repeat: isCurrent ? Infinity : 0,
                      duration: 2,
                      ease: 'easeInOut',
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-green/20 border-green/40'
                        : isCurrent
                          ? 'bg-yellow/[0.15] border-yellow/40 cursor-pointer hover:bg-yellow/[0.25]'
                          : 'bg-cream/[0.03] border-cream/[0.08]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={14} className="text-green/70" />
                    ) : isCurrent ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow/60" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-cream/10" />
                    )}
                  </motion.div>
                </button>
                <span className={`font-lora text-[9px] ${
                  isCompleted ? 'text-green/40' : isCurrent ? 'text-yellow/50' : 'text-cream/15'
                }`}>
                  {dayLabel}
                </span>
              </div>

              {/* Connecting line (not after last step) */}
              {i < localSteps.length - 1 && (
                <div className="flex-1 mx-1">
                  <div className={`h-0.5 w-full rounded-full ${
                    isCompleted ? 'bg-green/30' : 'bg-cream/[0.06]'
                  }`}>
                    {/* Dashed overlay for incomplete */}
                    {!isCompleted && (
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 4px, var(--tw-bg-opacity, rgba(255,255,255,0.04)) 4px, var(--tw-bg-opacity, rgba(255,255,255,0.04)) 8px)`,
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
