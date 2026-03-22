'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Coins, Clock, Check } from 'lucide-react'
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
  cooldownMinutes?: number // default cooldown between péripéties
  skipCostGold?: number // gold cost to skip cooldown
  bonusMultiplier?: number // gold bonus when skipping cooldown
}

export function PeripetiesCarousel({
  tasks,
  cooldownMinutes = 30,
  skipCostGold = 10,
  bonusMultiplier = 1.5,
}: PeripetiesCarouselProps) {
  const supabase = createClient()
  const router = useRouter()
  const [localTasks, setLocalTasks] = useState(tasks)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null)
  const [now, setNow] = useState(new Date())

  // Find active index (first pending/in_progress task)
  const activeIndex = localTasks.findIndex(t => t.status === 'pending' || t.status === 'in_progress')
  const completedTasks = localTasks.filter(t => t.status === 'completed' || t.status === 'skipped')
  const activeTask = activeIndex >= 0 ? localTasks[activeIndex] : null
  const futureCount = activeIndex >= 0 ? localTasks.length - activeIndex - 1 : 0

  // Cooldown timer
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const isInCooldown = cooldownEnd && now < cooldownEnd
  const cooldownRemaining = cooldownEnd
    ? Math.max(0, Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000))
    : 0

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleComplete = async (taskId: string) => {
    await supabase
      .from('scheduled_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId)

    setLocalTasks(prev =>
      prev.map(t => t.task_id === taskId ? { ...t, status: 'completed' } : t)
    )

    // Start cooldown for next task
    const cd = new Date()
    cd.setMinutes(cd.getMinutes() + cooldownMinutes)
    setCooldownEnd(cd)
    setExpandedId(null)
    router.refresh()
  }

  const handleSkipCooldown = () => {
    setCooldownEnd(null)
    // In a real app, deduct gold here via supabase RPC
  }

  // Build visible cards: completed (past) + active + locked indicator
  const visibleCards: React.ReactNode[] = []

  // Past completed tasks (swipeable to see)
  completedTasks.forEach((task) => {
    visibleCards.push(
      <CarouselCard key={task.task_id} className="w-[260px]">
        <div className="bg-cream/[0.03] border border-cream/[0.04] rounded-xl p-4 space-y-2 opacity-50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green/[0.15] flex items-center justify-center">
              <Check size={12} className="text-green/60" />
            </div>
            <span className="font-medieval text-[10px] text-green/40">Terminee</span>
          </div>
          <h3 className="font-cinzel text-[13px] text-cream/40 leading-tight">{task.task_name}</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{task.category_emoji}</span>
            <span className="font-lora text-[11px] text-cream/20">{task.category_name}</span>
          </div>
        </div>
      </CarouselCard>
    )
  })

  // Active task or cooldown
  if (activeTask && !isInCooldown) {
    visibleCards.push(
      <CarouselCard
        key={activeTask.task_id}
        className="w-[260px]"
        onClick={() => setExpandedId(expandedId === activeTask.task_id ? null : activeTask.task_id)}
      >
        <div className="bg-cream/[0.06] border border-yellow/[0.15] rounded-xl p-4 space-y-3 ring-1 ring-yellow/[0.08]">
          {/* Active badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow/60 animate-pulse" />
              <span className="font-medieval text-[10px] text-yellow/50 tracking-widest uppercase">Active</span>
            </div>
            <span className="font-cinzel text-[12px] text-yellow/60">{activeTask.points} or</span>
          </div>

          {/* Task info */}
          <h3 className="font-cinzel text-[15px] text-cream/90 leading-tight">{activeTask.task_name}</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{activeTask.category_emoji}</span>
              <span className="font-lora text-[12px] text-cream/35">{activeTask.category_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-cream/20" />
              <span className="font-lora text-[11px] text-cream/20">{activeTask.duration_minutes}min</span>
            </div>
          </div>

          {/* Tip */}
          {activeTask.task_tip && (
            <p className="font-lora text-[11px] text-cream/20 italic leading-snug">
              💡 {activeTask.task_tip}
            </p>
          )}
        </div>
      </CarouselCard>
    )
  } else if (isInCooldown) {
    // Cooldown card
    visibleCards.push(
      <CarouselCard key="cooldown" className="w-[260px]">
        <div className="bg-cream/[0.04] border border-cream/[0.08] rounded-xl p-4 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock size={16} className="text-cream/30" />
            <span className="font-medieval text-[10px] text-cream/25 tracking-widest uppercase">Repos</span>
          </div>

          <div className="font-cinzel text-2xl text-cream/50">
            {formatCooldown(cooldownRemaining)}
          </div>

          <p className="font-lora text-[11px] text-cream/20">
            Prochaine peripetie disponible bientot
          </p>

          {/* Skip cooldown button */}
          <button
            onClick={handleSkipCooldown}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-yellow/[0.08] border border-yellow/15 text-yellow/60 font-cinzel text-[12px] hover:bg-yellow/[0.15] transition-colors"
          >
            <Coins size={12} />
            Debloquer ({skipCostGold} or) — bonus x{bonusMultiplier}
          </button>
        </div>
      </CarouselCard>
    )
  }

  // Future locked indicator
  if (futureCount > 0) {
    visibleCards.push(
      <CarouselCard key="locked" className="w-[180px]">
        <div className="bg-cream/[0.02] border border-cream/[0.04] rounded-xl p-4 text-center space-y-2 h-full flex flex-col items-center justify-center">
          <Lock size={20} className="text-cream/15" />
          <p className="font-medieval text-[10px] text-cream/15 tracking-widest uppercase">
            {futureCount} peripetie{futureCount > 1 ? 's' : ''}
          </p>
          <p className="font-lora text-[10px] text-cream/10">a venir</p>
        </div>
      </CarouselCard>
    )
  }

  // Empty state
  if (visibleCards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-lora text-[13px] text-cream/30">Aucune peripetie cette semaine</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase px-1">
        Peripeties
      </p>

      <SwipeCarousel>{visibleCards}</SwipeCarousel>

      {/* Expanded task detail modal */}
      <AnimatePresence>
        {expandedId && activeTask && expandedId === activeTask.task_id && (
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
                <span className="text-3xl">{activeTask.category_emoji}</span>
                <h3 className="font-cinzel text-lg text-cream font-semibold">{activeTask.task_name}</h3>
                <p className="font-lora text-[13px] text-cream/40">
                  {activeTask.duration_minutes} min · {activeTask.points} pieces d&apos;or
                </p>
              </div>

              {activeTask.task_tip && (
                <p className="font-lora text-[12px] text-cream/30 text-center italic">
                  {activeTask.task_tip}
                </p>
              )}

              <button
                onClick={() => handleComplete(activeTask.task_id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green/[0.15] border border-green/20 text-green/80 font-cinzel text-[14px] hover:bg-green/[0.25] transition-colors"
              >
                <Check size={16} />
                Terminer la peripetie
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
