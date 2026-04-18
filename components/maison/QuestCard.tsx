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
  scheduled_date?: string
  step_number?: number
}

interface QuestCardProps {
  questName: string
  categoryEmoji: string
  steps: QuestStep[]
  totalPoints: number
}

export function QuestCard({ questName, categoryEmoji, steps, totalPoints }: QuestCardProps) {
  const supabase = createClient()
  const router = useRouter()
  const [localSteps, setLocalSteps] = useState(steps)

  const completedCount = localSteps.filter(s => s.status === 'completed').length
  const firstPendingIndex = localSteps.findIndex(s => s.status !== 'completed' && s.status !== 'skipped')

  const handleComplete = async (taskId: string) => {
    await supabase
      .from('corvee_steps')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId)

    setLocalSteps(prev =>
      prev.map(s => s.task_id === taskId ? { ...s, status: 'completed' } : s)
    )
    router.refresh()
  }

  const allDone = completedCount === localSteps.length

  return (
    <div className="rounded-xl p-4 space-y-4" style={{
      background: 'linear-gradient(135deg, rgb(var(--card)) 0%, rgb(var(--primary)/0.04) 100%)',
      border: '1px solid rgb(var(--primary)/0.15)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{categoryEmoji}</span>
          <h3 className="font-serif text-[14px] text-foreground/70 font-semibold">{questName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-[10px] text-foreground/25">{completedCount}/{localSteps.length}</span>
          <span className="font-sans font-semibold text-[11px] text-yellow/50">{totalPoints} or</span>
        </div>
      </div>

      {/* Horizontal step dots with connecting lines */}
      <div className="flex items-center w-full px-1">
        {localSteps.map((step, i) => {
          const isCompleted = step.status === 'completed' || step.status === 'skipped'
          const isCurrent = i === firstPendingIndex
          // Adapt size based on number of steps
          const isCompact = localSteps.length > 8
          const dotSize = isCompact ? 'w-5 h-5' : 'w-7 h-7'
          const iconSize = isCompact ? 10 : 12

          return (
            <div key={step.task_id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isCurrent && handleComplete(step.task_id)}
                  disabled={!isCurrent}
                  className="relative flex items-center justify-center min-w-[36px] min-h-[36px]"
                >
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-yellow/30"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      style={{ margin: isCompact ? -3 : -4 }}
                    />
                  )}
                  <div className={`${dotSize} rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-green/20 border-green/40'
                      : isCurrent
                        ? 'bg-yellow/[0.2] border-yellow/50 cursor-pointer hover:bg-yellow/[0.3]'
                        : 'bg-white/40 border-border'
                  }`}>
                    {isCompleted ? (
                      <Check size={iconSize} className="text-green/70" />
                    ) : isCurrent ? (
                      <div className={`${isCompact ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-yellow/60`} />
                    ) : (
                      <div className={`${isCompact ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-foreground/10`} />
                    )}
                  </div>
                </button>
              </div>

              {i < localSteps.length - 1 && (
                <div className={`flex-1 ${isCompact ? 'mx-0.5' : 'mx-1'}`}>
                  <div className={`h-0.5 w-full rounded-full transition-colors ${
                    isCompleted ? 'bg-green/30' : 'bg-white/80'
                  }`} />
                </div>
              )}
            </div>
          )
        })}

        <div className="ml-1.5 flex-shrink-0">
          <span className={`${localSteps.length > 8 ? 'text-sm' : 'text-lg'} transition-opacity ${allDone ? 'opacity-80' : 'opacity-20'}`}>
            💰
          </span>
        </div>
      </div>
    </div>
  )
}
