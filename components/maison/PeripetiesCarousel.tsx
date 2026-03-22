'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SwipeCarousel, CarouselCard } from './SwipeCarousel'

interface PeripetieTask {
  task_id: string
  task_name: string
  task_tip?: string
  category_emoji: string
  category_name: string
  points: number
  status: string
  scheduled_date: string
  duration_minutes: number
}

interface PeripetiesCarouselProps {
  tasks: PeripetieTask[]
}

export function PeripetiesCarousel({ tasks }: PeripetiesCarouselProps) {
  const supabase = createClient()
  const router = useRouter()
  const [localTasks, setLocalTasks] = useState(tasks)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleComplete = async (taskId: string) => {
    await supabase
      .from('scheduled_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId)

    setLocalTasks(prev =>
      prev.map(t => t.task_id === taskId ? { ...t, status: 'completed' } : t)
    )
    setExpandedId(null)
    router.refresh()
  }

  if (localTasks.length === 0) return null

  const cards = localTasks.map((task) => {
    const isCompleted = task.status === 'completed' || task.status === 'skipped'

    return (
      <CarouselCard
        key={task.task_id}
        onClick={() => !isCompleted && setExpandedId(task.task_id)}
      >
        <div className={`rounded-xl p-4 space-y-2 h-full border ${
          isCompleted
            ? 'bg-cream/[0.03] border-cream/[0.04] opacity-50'
            : 'bg-cream/[0.06] border-cream/[0.08]'
        }`}>
          {/* Status + points */}
          <div className="flex items-center justify-between">
            {isCompleted ? (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-green/[0.15] flex items-center justify-center">
                  <Check size={10} className="text-green/60" />
                </div>
                <span className="font-medieval text-[10px] text-green/40">Fait</span>
              </div>
            ) : (
              <span className="font-medieval text-[10px] text-cream/25 tracking-widest uppercase">Peripetie</span>
            )}
            <span className="font-cinzel text-[11px] text-yellow/50">{task.points} or</span>
          </div>

          {/* Task name */}
          <h3 className={`font-cinzel text-[13px] leading-tight ${
            isCompleted ? 'text-cream/30' : 'text-cream/80'
          }`}>
            {task.task_name}
          </h3>

          {/* Category + duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{task.category_emoji}</span>
              <span className="font-lora text-[11px] text-cream/25">{task.category_name}</span>
            </div>
            {!isCompleted && (
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-cream/15" />
                <span className="font-lora text-[10px] text-cream/15">{task.duration_minutes}min</span>
              </div>
            )}
          </div>

          {/* Quick validate for non-completed */}
          {!isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleComplete(task.task_id)
              }}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green/[0.08] border border-green/15 text-green/60 font-cinzel text-[11px] hover:bg-green/[0.15] transition-colors"
            >
              <Check size={12} />
              Valider
            </button>
          )}
        </div>
      </CarouselCard>
    )
  })

  return (
    <div className="space-y-3">
      <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase px-1">
        Peripeties
      </p>

      <SwipeCarousel>{cards}</SwipeCarousel>

      {/* Expanded detail modal */}
      <AnimatePresence>
        {expandedId && (() => {
          const task = localTasks.find(t => t.task_id === expandedId)
          if (!task) return null
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setExpandedId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-sm bg-gradient-to-b from-charcoal to-ink rounded-2xl border border-cream/[0.08] p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center space-y-2">
                  <span className="text-3xl">{task.category_emoji}</span>
                  <h3 className="font-cinzel text-lg text-cream font-semibold">{task.task_name}</h3>
                  <p className="font-lora text-[13px] text-cream/40">
                    {task.duration_minutes} min · {task.points} pieces d&apos;or
                  </p>
                </div>

                {task.task_tip && (
                  <p className="font-lora text-[12px] text-cream/30 text-center italic">
                    {task.task_tip}
                  </p>
                )}

                <button
                  onClick={() => handleComplete(task.task_id)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green/[0.15] border border-green/20 text-green/80 font-cinzel text-[14px] hover:bg-green/[0.25] transition-colors"
                >
                  <Check size={16} />
                  Terminer
                </button>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
