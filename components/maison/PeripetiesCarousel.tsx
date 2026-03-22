'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, Lock, Coins, Sparkles } from 'lucide-react'
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
  unlockCost?: number
  bonusMultiplier?: number
}

export function PeripetiesCarousel({
  tasks,
  unlockCost = 15,
  bonusMultiplier = 1.5,
}: PeripetiesCarouselProps) {
  const supabase = createClient()
  const router = useRouter()
  const [localTasks, setLocalTasks] = useState(tasks)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())

  // Sort: completed first, then pending/in_progress (active), then future pending
  // Active = first non-completed task
  const activeIndex = localTasks.findIndex(t => t.status === 'pending' || t.status === 'in_progress')

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

  const handleUnlock = (taskId: string) => {
    // In production: deduct gold via supabase RPC
    setUnlockedIds(prev => new Set(prev).add(taskId))
  }

  if (localTasks.length === 0) return null

  const cards = localTasks.map((task, i) => {
    const isCompleted = task.status === 'completed' || task.status === 'skipped'
    const isActive = i === activeIndex
    const isFuture = activeIndex >= 0 && i > activeIndex
    const isUnlocked = unlockedIds.has(task.task_id)
    const isBoosted = isFuture && isUnlocked
    const isLocked = isFuture && !isUnlocked

    // Completed cards (left side)
    if (isCompleted) {
      return (
        <CarouselCard key={task.task_id}>
          <div className="rounded-xl p-4 space-y-2 h-full bg-cream/[0.03] border border-cream/[0.04] opacity-40">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-green/[0.2] flex items-center justify-center">
                <Check size={10} className="text-green/60" />
              </div>
              <span className="font-medieval text-[10px] text-green/40">Fait</span>
              <span className="ml-auto font-cinzel text-[10px] text-yellow/30">{task.points} or</span>
            </div>
            <h3 className="font-cinzel text-[12px] text-cream/30 leading-tight">{task.task_name}</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs">{task.category_emoji}</span>
              <span className="font-lora text-[10px] text-cream/15">{task.category_name}</span>
            </div>
          </div>
        </CarouselCard>
      )
    }

    // Locked future cards (right side)
    if (isLocked) {
      return (
        <CarouselCard key={task.task_id}>
          <div className="rounded-xl p-4 h-full bg-charcoal/60 border border-cream/[0.04] backdrop-blur-sm relative overflow-hidden">
            {/* Blurred content hint */}
            <div className="blur-sm opacity-20 space-y-2 pointer-events-none">
              <span className="font-medieval text-[10px] text-cream/30">Peripetie</span>
              <h3 className="font-cinzel text-[12px] text-cream/40">???</h3>
              <div className="flex items-center gap-1">
                <span className="text-xs">{task.category_emoji}</span>
                <span className="font-lora text-[10px] text-cream/20">{task.category_name}</span>
              </div>
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Lock size={20} className="text-cream/20" />
              <button
                onClick={() => handleUnlock(task.task_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow/[0.1] border border-yellow/20 text-yellow/60 font-cinzel text-[10px] hover:bg-yellow/[0.2] transition-colors"
              >
                <Coins size={10} />
                {unlockCost} or
              </button>
              <span className="font-lora text-[9px] text-cream/15">Bonus x{bonusMultiplier}</span>
            </div>
          </div>
        </CarouselCard>
      )
    }

    // Active card (center) or boosted unlocked card
    return (
      <CarouselCard
        key={task.task_id}
        onClick={() => setExpandedId(task.task_id)}
      >
        <div className={`rounded-xl p-4 space-y-2 h-full border ${
          isActive
            ? 'bg-cream/[0.08] border-yellow/[0.2] ring-1 ring-yellow/[0.1]'
            : 'bg-cream/[0.06] border-cream/[0.08]'
        }`}>
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isActive && <div className="w-2 h-2 rounded-full bg-yellow/60 animate-pulse" />}
              <span className="font-medieval text-[10px] text-yellow/50 tracking-widest uppercase">
                {isActive ? 'Active' : 'Peripetie'}
              </span>
              {isBoosted && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow/[0.15] border border-yellow/20">
                  <Sparkles size={8} className="text-yellow/60" />
                  <span className="font-medieval text-[8px] text-yellow/60">x{bonusMultiplier}</span>
                </span>
              )}
            </div>
            <span className="font-cinzel text-[11px] text-yellow/60">
              {isBoosted ? Math.round(task.points * bonusMultiplier) : task.points} or
            </span>
          </div>

          {/* Task name */}
          <h3 className="font-cinzel text-[13px] text-cream/80 leading-tight">{task.task_name}</h3>

          {/* Category + duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{task.category_emoji}</span>
              <span className="font-lora text-[11px] text-cream/25">{task.category_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-cream/15" />
              <span className="font-lora text-[10px] text-cream/15">{task.duration_minutes}min</span>
            </div>
          </div>

          {/* Quick validate */}
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
        </div>
      </CarouselCard>
    )
  })

  return (
    <div className="space-y-3">
      <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase px-1">
        Peripeties
      </p>

      <SwipeCarousel initialIndex={activeIndex >= 0 ? activeIndex : 0}>
        {cards}
      </SwipeCarousel>

      {/* Expanded detail modal */}
      <AnimatePresence>
        {expandedId && (() => {
          const task = localTasks.find(t => t.task_id === expandedId)
          if (!task) return null
          const isBoosted = unlockedIds.has(task.task_id)
          const displayPoints = isBoosted ? Math.round(task.points * bonusMultiplier) : task.points

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
                    {task.duration_minutes} min · {displayPoints} pieces d&apos;or
                    {isBoosted && ' (bonus)'}
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
