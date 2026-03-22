'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

interface PeripetiesCarouselProps {
  tasks: any[]
}

export function PeripetiesCarousel({ tasks }: PeripetiesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'A faire', color: 'text-yellow/70 bg-yellow/[0.08]' },
    in_progress: { label: 'En cours', color: 'text-blue/70 bg-blue/[0.08]' },
    completed: { label: 'Fait', color: 'text-green/70 bg-green/[0.08]' },
    skipped: { label: 'Passe', color: 'text-cream/30 bg-cream/[0.04]' },
  }

  return (
    <div className="space-y-3">
      <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase px-1">
        Peripeties de la semaine
      </p>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tasks.map((task, index) => {
          const status = statusLabels[task.status] || statusLabels.pending
          return (
            <motion.div
              key={task.id || index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[260px] snap-center bg-cream/[0.04] border border-cream/[0.06] rounded-xl p-4 space-y-3"
            >
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medieval ${status.color}`}>
                  {status.label}
                </span>
                <span className="font-cinzel text-[12px] text-yellow/50">
                  {task.points || 0} or
                </span>
              </div>

              {/* Task name */}
              <h3 className="font-cinzel text-[14px] text-cream/80 leading-tight">
                {task.task_name || task.name || 'Quete'}
              </h3>

              {/* Category + date */}
              <div className="flex items-center justify-between">
                <span className="font-lora text-[12px] text-cream/30">
                  {task.category_emoji || '⚔️'} {task.category_name || ''}
                </span>
                <span className="font-lora text-[11px] text-cream/20">
                  {task.scheduled_date ? new Date(task.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
            </motion.div>
          )
        })}

        {tasks.length === 0 && (
          <div className="w-full text-center py-8">
            <p className="font-lora text-[13px] text-cream/30">Aucune peripetie cette semaine</p>
          </div>
        )}
      </div>

      {/* Dots indicator */}
      {tasks.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {tasks.slice(0, Math.min(tasks.length, 8)).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-cream/10" />
          ))}
        </div>
      )}
    </div>
  )
}
