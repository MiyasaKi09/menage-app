'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, Lock, Coins, Sparkles, Crosshair } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SwipeCarousel, CarouselCard, type SwipeCarouselHandle } from './SwipeCarousel'

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
  is_unlocked?: boolean
  is_boosted?: boolean
  boost_multiplier?: number
}

interface PeripetiesCarouselProps {
  tasks: PeripetieTask[]
  userId: string
  householdId: string
  userPoints?: number
  unlockCost?: number
  bonusMultiplier?: number
}

function CountdownBadge({ date }: { date: string }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const target = new Date(date + 'T00:00:00')
    const update = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) { setRemaining('Disponible'); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      setRemaining(days > 0 ? `${days}j ${hours}h` : `${hours}h`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [date])

  return <span className="font-sans text-[9px] text-foreground/25">{remaining}</span>
}

export function PeripetiesCarousel({
  tasks,
  userId,
  householdId,
  userPoints = 0,
  unlockCost = 15,
  bonusMultiplier = 1.5,
}: PeripetiesCarouselProps) {
  const supabase = createClient()
  const router = useRouter()
  const [localTasks, setLocalTasks] = useState(tasks)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAtActive, setIsAtActive] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const carouselRef = useRef<SwipeCarouselHandle>(null)

  const todayStr = new Date().toISOString().split('T')[0]

  const activeIndex = localTasks.findIndex(t =>
    (t.status === 'pending' || t.status === 'in_progress') &&
    (t.scheduled_date <= todayStr || t.is_unlocked)
  )

  const handleComplete = async (taskId: string) => {
    const task = localTasks.find(t => t.task_id === taskId)
    if (!task || completing) return

    setCompleting(taskId)
    const isBoosted = task.is_boosted || false
    const mult = task.boost_multiplier || bonusMultiplier
    const finalPoints = isBoosted ? Math.round(task.points * mult) : task.points
    const completedAt = new Date().toISOString()

    try {
      // 1. Update scheduled_task
      await supabase
        .from('scheduled_tasks')
        .update({
          status: 'completed',
          completed_at: completedAt,
          completed_by: userId,
          points_earned: finalPoints,
        })
        .eq('id', taskId)

      // 2. Create task_history entry
      await supabase
        .from('task_history')
        .insert({
          scheduled_task_id: taskId,
          household_id: householdId,
          profile_id: userId,
          task_name: task.task_name,
          category_name: task.category_name,
          points_earned: finalPoints,
          completed_at: completedAt,
          day_of_week: new Date().getDay(),
          hour_of_day: new Date().getHours(),
        })

      // 3. Update profile stats (total_points + tasks_completed)
      await supabase.rpc('increment_profile_stats', {
        p_profile_id: userId,
        p_points: finalPoints,
      })

      // 4. Update household member stats
      await supabase.rpc('increment_household_member_stats', {
        p_profile_id: userId,
        p_household_id: householdId,
        p_points: finalPoints,
      })

      // Update local state — keep task visible but mark as completed
      setLocalTasks(prev =>
        prev.map(t => t.task_id === taskId ? { ...t, status: 'completed', points: finalPoints } : t)
      )
      setExpandedId(null)
      router.refresh()
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setCompleting(null)
    }
  }

  const [localPoints, setLocalPoints] = useState(userPoints)
  const [unlockError, setUnlockError] = useState<string | null>(null)

  const handleUnlock = async (taskId: string) => {
    setUnlockError(null)

    if (localPoints < unlockCost) {
      setUnlockError('Points insuffisants')
      return
    }

    // Deduct points first
    const { data: success, error: deductError } = await supabase.rpc('deduct_points', {
      p_profile_id: userId,
      p_amount: unlockCost,
    })

    if (deductError || !success) {
      setUnlockError('Points insuffisants')
      return
    }

    const { error } = await supabase
      .from('scheduled_tasks')
      .update({
        is_unlocked: true,
        is_boosted: true,
        unlocked_at: new Date().toISOString(),
        unlocked_by: userId,
        boost_multiplier: bonusMultiplier,
      })
      .eq('id', taskId)

    if (!error) {
      setLocalPoints(prev => prev - unlockCost)
      setLocalTasks(prev =>
        prev.map(t => t.task_id === taskId
          ? { ...t, is_unlocked: true, is_boosted: true, boost_multiplier: bonusMultiplier }
          : t
        )
      )
      router.refresh()
    }
  }

  const handleViewChange = (index: number) => {
    setIsAtActive(activeIndex >= 0 && index === activeIndex)
  }

  if (localTasks.length === 0) return null

  const cards = localTasks.map((task, i) => {
    const isCompleted = task.status === 'completed' || task.status === 'skipped'
    const isScheduledFuture = task.scheduled_date > todayStr
    const isUnlocked = task.is_unlocked || false
    const isBoosted = task.is_boosted || false
    const isLocked = isScheduledFuture && !isUnlocked && !isCompleted
    const mult = task.boost_multiplier || bonusMultiplier
    const isBeingCompleted = completing === task.task_id

    // Completed — stays visible (not yet confirmed by others)
    if (isCompleted) {
      return (
        <CarouselCard key={task.task_id}>
          <div className="rounded-xl p-4 space-y-2 h-full bg-green/[0.04] border border-green/[0.1]">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-green/[0.2] flex items-center justify-center">
                <Check size={12} className="text-green/70" />
              </div>
              <span className="font-sans text-[10px] text-green/50">Termine</span>
              <span className="ml-auto font-sans font-semibold text-[11px] text-yellow/40">+{task.points} or</span>
            </div>
            <h3 className="font-sans font-semibold text-[13px] text-foreground/45 leading-tight">{task.task_name}</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs">{task.category_emoji}</span>
              <span className="font-sans text-[10px] text-foreground/25">{task.category_name}</span>
            </div>
            <p className="font-sans text-[9px] text-foreground/15 italic">En attente de confirmation</p>
          </div>
        </CarouselCard>
      )
    }

    if (isLocked) {
      return (
        <CarouselCard key={task.task_id}>
          <div className="rounded-xl p-4 h-full bg-foreground/40 backdrop-blur-sm border border-border/40 relative overflow-hidden">
            <div className="blur-sm opacity-20 space-y-2 pointer-events-none">
              <span className="font-sans text-[10px] text-foreground/30">Peripetie</span>
              <h3 className="font-sans font-semibold text-[12px] text-foreground/40">???</h3>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Lock size={18} className="text-foreground/20" />
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-foreground/20" />
                <CountdownBadge date={task.scheduled_date} />
              </div>
              <button
                onClick={() => handleUnlock(task.task_id)}
                disabled={localPoints < unlockCost}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-sans font-semibold text-[10px] transition-colors ${
                  localPoints < unlockCost
                    ? 'bg-foreground/[0.05] border-foreground/10 text-foreground/20 cursor-not-allowed'
                    : 'bg-yellow/[0.1] border-yellow/20 text-yellow/60 hover:bg-yellow/[0.2]'
                }`}
              >
                <Coins size={10} />
                {unlockCost} or
              </button>
              {unlockError && <span className="font-sans text-[8px] text-red/60">{unlockError}</span>}
              {!unlockError && <span className="font-sans text-[8px] text-foreground/15">Bonus x{bonusMultiplier}</span>}
            </div>
          </div>
        </CarouselCard>
      )
    }

    // Active / playable
    return (
      <CarouselCard
        key={task.task_id}
        onClick={() => setExpandedId(task.task_id)}
      >
        <div className={`rounded-xl p-4 space-y-2 h-full border ${
          i === activeIndex
            ? 'bg-white border-yellow/[0.2] ring-1 ring-yellow/[0.1]'
            : 'bg-white/80 border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {i === activeIndex && <div className="w-2 h-2 rounded-full bg-yellow/60 animate-pulse" />}
              <span className="font-sans text-[10px] text-yellow/50 tracking-widest uppercase">
                {i === activeIndex ? 'Active' : 'Peripetie'}
              </span>
              {isBoosted && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow/[0.15] border border-yellow/20">
                  <Sparkles size={8} className="text-yellow/60" />
                  <span className="font-sans text-[8px] text-yellow/60">x{mult}</span>
                </span>
              )}
            </div>
            <span className="font-sans font-semibold text-[11px] text-yellow/60">
              {isBoosted ? Math.round(task.points * mult) : task.points} or
            </span>
          </div>

          <h3 className="font-sans font-semibold text-[13px] text-foreground/70 leading-tight">{task.task_name}</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{task.category_emoji}</span>
              <span className="font-sans text-[11px] text-foreground/25">{task.category_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-foreground/15" />
              <span className="font-sans text-[10px] text-foreground/15">{task.duration_minutes}min</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleComplete(task.task_id)
            }}
            disabled={isBeingCompleted}
            className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green/[0.08] border border-green/15 text-green/60 font-sans font-semibold text-[11px] hover:bg-green/[0.15] transition-colors disabled:opacity-30"
          >
            <Check size={12} />
            {isBeingCompleted ? 'En cours...' : 'Valider'}
          </button>
        </div>
      </CarouselCard>
    )
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
          Peripeties
        </p>
        {activeIndex >= 0 && (
          <button
            onClick={() => carouselRef.current?.goToIndex(activeIndex)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-sans text-[9px] transition-colors ${
              isAtActive
                ? 'bg-yellow/[0.05] border-yellow/10 text-yellow/30'
                : 'bg-yellow/[0.12] border-yellow/20 text-yellow/60 hover:bg-yellow/[0.2]'
            }`}
          >
            <Crosshair size={10} />
            Active
          </button>
        )}
      </div>

      <SwipeCarousel
        ref={carouselRef}
        initialIndex={activeIndex >= 0 ? activeIndex : 0}
        onActiveIndexChange={handleViewChange}
      >
        {cards}
      </SwipeCarousel>

      {/* Detail modal */}
      <AnimatePresence>
        {expandedId && (() => {
          const task = localTasks.find(t => t.task_id === expandedId)
          if (!task) return null
          const isBoosted = task.is_boosted || false
          const mult = task.boost_multiplier || bonusMultiplier
          const displayPoints = isBoosted ? Math.round(task.points * mult) : task.points

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setExpandedId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-sm bg-white rounded-[22px] border border-border shadow-xl p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center space-y-2">
                  <span className="text-3xl">{task.category_emoji}</span>
                  <h3 className="font-serif text-lg text-foreground font-semibold">{task.task_name}</h3>
                  <p className="font-sans text-[13px] text-foreground/40">
                    {task.duration_minutes} min · {displayPoints} pieces d&apos;or
                    {isBoosted && ' (bonus)'}
                  </p>
                </div>

                {task.task_tip && (
                  <p className="font-sans text-[12px] text-foreground/30 text-center italic">
                    {task.task_tip}
                  </p>
                )}

                <button
                  onClick={() => handleComplete(task.task_id)}
                  disabled={completing === task.task_id}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green/[0.15] border border-green/20 text-green/80 font-sans font-semibold text-[14px] hover:bg-green/[0.25] transition-colors disabled:opacity-30"
                >
                  <Check size={16} />
                  {completing === task.task_id ? 'En cours...' : 'Terminer'}
                </button>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
