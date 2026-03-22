'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ConsecrationCarouselProps {
  tasks: any[]
  userId: string
}

type Decision = 'validated' | 'adjourned' | 'refused'

export function ConsecrationCarousel({ tasks, userId }: ConsecrationCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
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

  return (
    <div className="space-y-3">
      <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase px-1">
        Consecration
      </p>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibleTasks.map((task, index) => {
          const taskData = task.household_tasks || {}
          const category = taskData.categories || {}
          return (
            <motion.div
              key={task.id || index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[260px] snap-center bg-cream/[0.04] border border-cream/[0.06] rounded-xl p-4 space-y-3 cursor-pointer hover:bg-cream/[0.06] transition-colors"
              onClick={() => setActiveTask(task)}
            >
              {/* Checkmark */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green/[0.15] flex items-center justify-center">
                  <Check size={14} className="text-green/70" />
                </div>
                <span className="font-medieval text-[10px] text-green/50">Terminee</span>
              </div>

              {/* Task name */}
              <h3 className="font-cinzel text-[14px] text-cream/80 leading-tight">
                {taskData.name || 'Quete'}
              </h3>

              {/* Category */}
              <div className="flex items-center gap-1.5">
                <span>{category.emoji || '⚔️'}</span>
                <span className="font-lora text-[12px] text-cream/30">{category.name || ''}</span>
              </div>

              <p className="font-lora text-[11px] text-cream/20">Appuyez pour valider</p>
            </motion.div>
          )
        })}

        {visibleTasks.length === 0 && (
          <div className="w-full text-center py-8">
            <p className="font-lora text-[13px] text-cream/30">Aucune tache a confirmer</p>
          </div>
        )}
      </div>

      {/* Validation popup */}
      <AnimatePresence>
        {activeTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-charcoal/80 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => setActiveTask(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-gradient-to-b from-charcoal to-ink rounded-2xl border border-cream/[0.08] p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-2">
                <h3 className="font-cinzel text-lg text-cream font-semibold">
                  {activeTask.household_tasks?.name || 'Quete'}
                </h3>
                <p className="font-lora text-[13px] text-cream/40">
                  Confirmez-vous que cette tache a bien ete realisee ?
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleDecision(activeTask.id, 'validated')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green/[0.15] border border-green/20 text-green/80 font-cinzel text-[14px] hover:bg-green/[0.25] transition-colors"
                >
                  <Check size={16} />
                  Valider
                </button>
                <button
                  onClick={() => handleDecision(activeTask.id, 'adjourned')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow/[0.1] border border-yellow/20 text-yellow/70 font-cinzel text-[14px] hover:bg-yellow/[0.2] transition-colors"
                >
                  <Clock size={16} />
                  Ajourner
                </button>
                <button
                  onClick={() => handleDecision(activeTask.id, 'refused')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red/[0.1] border border-red/20 text-red/70 font-cinzel text-[14px] hover:bg-red/[0.2] transition-colors"
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
