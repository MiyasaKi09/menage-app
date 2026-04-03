'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SwipeCarousel, CarouselCard } from './SwipeCarousel'

interface ConsecrationCarouselProps {
  tasks: any[]
  userId: string
}

type Decision = 'validated' | 'adjourned' | 'refused'

export function ConsecrationCarousel({ tasks, userId }: ConsecrationCarouselProps) {
  const [activeTask, setActiveTask] = useState<any | null>(null)
  const [processed, setProcessed] = useState<Set<string>>(new Set())

  const handleDecision = async (taskId: string, decision: Decision) => {
    const supabase = createClient()

    await supabase
      .from('scheduled_tasks')
      .update({
        validation_status: decision,
        validated_by: userId,
        validated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    setProcessed((prev) => new Set(prev).add(taskId))
    setActiveTask(null)
  }

  const visibleTasks = tasks.filter((t) => !processed.has(t.id))

  if (visibleTasks.length === 0) {
    return null
  }

  const cards = visibleTasks.map((task, index) => {
    const taskData = task.household_tasks || {}
    const category = taskData.categories || {}
    return (
      <CarouselCard
        key={task.id || index}
        className="w-[260px]"
        onClick={() => setActiveTask(task)}
      >
        <div className="bg-white/60 border border-border/60 rounded-xl p-4 space-y-3">
          {/* Checkmark */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green/[0.15] flex items-center justify-center">
              <Check size={12} className="text-green/60" />
            </div>
            <span className="font-sans text-[10px] text-green/40">Terminee</span>
          </div>

          {/* Task name */}
          <h3 className="font-serif text-[14px] text-foreground/70 leading-tight">
            {taskData.name || 'Quete'}
          </h3>

          {/* Category */}
          <div className="flex items-center gap-1.5">
            <span>{category.emoji || '⚔️'}</span>
            <span className="font-sans text-[12px] text-foreground/30">{category.name || ''}</span>
          </div>

          <p className="font-sans text-[11px] text-foreground/20">Appuyez pour valider</p>
        </div>
      </CarouselCard>
    )
  })

  return (
    <div className="space-y-3">
      <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase px-1">
        Consecration
      </p>

      <SwipeCarousel>{cards}</SwipeCarousel>

      {/* Validation popup */}
      <AnimatePresence>
        {activeTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => setActiveTask(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-[22px] border border-border shadow-xl p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-2">
                <h3 className="font-serif text-lg text-foreground font-semibold">
                  {activeTask.household_tasks?.name || 'Quete'}
                </h3>
                <p className="font-sans text-[13px] text-foreground/40">
                  Confirmez-vous que cette tache a bien ete realisee ?
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleDecision(activeTask.id, 'validated')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green/[0.15] border border-green/20 text-green/80 font-sans font-semibold text-[14px] hover:bg-green/[0.25] transition-colors"
                >
                  <Check size={16} />
                  Valider
                </button>
                <button
                  onClick={() => handleDecision(activeTask.id, 'adjourned')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow/[0.1] border border-yellow/20 text-yellow/70 font-sans font-semibold text-[14px] hover:bg-yellow/[0.2] transition-colors"
                >
                  <Clock size={16} />
                  Ajourner
                </button>
                <button
                  onClick={() => handleDecision(activeTask.id, 'refused')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red/[0.1] border border-red/20 text-red/70 font-sans font-semibold text-[14px] hover:bg-red/[0.2] transition-colors"
                >
                  <X size={16} />
                  Refuser
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
