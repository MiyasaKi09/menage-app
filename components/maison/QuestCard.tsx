'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
// Check mark rendered as SVG text ✓ inside the map
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

// Sinuous path points for up to 10 steps — SVG coordinates in a 400x240 viewBox
// The path snakes from bottom-left to top-right like a treasure map
const PATH_POINTS = [
  { x: 40, y: 210 },
  { x: 100, y: 180 },
  { x: 170, y: 210 },
  { x: 230, y: 160 },
  { x: 180, y: 110 },
  { x: 120, y: 80 },
  { x: 190, y: 50 },
  { x: 260, y: 80 },
  { x: 320, y: 50 },
  { x: 370, y: 30 },
]

// Decorative icons scattered around the map
const DECORATIONS = [
  { x: 60, y: 60, char: '🧹', size: 14, opacity: 0.2 },
  { x: 300, y: 180, char: '🧽', size: 12, opacity: 0.15 },
  { x: 340, y: 120, char: '🪣', size: 13, opacity: 0.18 },
  { x: 80, y: 140, char: '🧴', size: 11, opacity: 0.15 },
  { x: 250, y: 200, char: '✨', size: 12, opacity: 0.2 },
]

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + (curr.x - prev.x) * 0.5
    const cpy1 = prev.y
    const cpx2 = prev.x + (curr.x - prev.x) * 0.5
    const cpy2 = curr.y
    d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`
  }
  return d
}

export function QuestCard({ questName, categoryEmoji, steps, totalPoints }: QuestCardProps) {
  const supabase = createClient()
  const router = useRouter()
  const [localSteps, setLocalSteps] = useState(steps)

  const completedCount = localSteps.filter(s => s.status === 'completed').length
  const firstPendingIndex = localSteps.findIndex(s => s.status !== 'completed' && s.status !== 'skipped')

  // Pick points along the path for our steps (evenly spaced)
  const stepPositions = localSteps.map((_, i) => {
    const pathIndex = Math.floor((i / Math.max(localSteps.length - 1, 1)) * (PATH_POINTS.length - 1))
    return PATH_POINTS[Math.min(pathIndex, PATH_POINTS.length - 1)]
  })

  // Build the SVG path through step positions
  const pathD = buildSmoothPath(stepPositions)

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

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Parchment background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #d4b896 0%, #c4a67a 30%, #b8956a 60%, #c9a87a 100%)',
        }}
      />
      {/* Parchment texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,0,0,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0,0,0,0.06) 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, rgba(0,0,0,0.05) 0%, transparent 45%)`,
        }}
      />
      {/* Burned/torn edge effect */}
      <div className="absolute inset-0 shadow-inner" style={{ boxShadow: 'inset 0 0 30px rgba(80,50,20,0.3)' }} />

      <div className="relative p-4 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{categoryEmoji}</span>
            <h3 className="font-cinzel text-[14px] text-amber-900 font-semibold">{questName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medieval text-[11px] text-amber-800/60">{completedCount}/{localSteps.length}</span>
            <span className="font-cinzel text-[12px] text-amber-900/70 font-bold">{totalPoints} or</span>
          </div>
        </div>

        {/* SVG Map */}
        <svg viewBox="0 0 400 240" className="w-full h-auto" style={{ minHeight: 160 }}>
          {/* Decorative icons */}
          {DECORATIONS.map((dec, i) => (
            <text
              key={`dec-${i}`}
              x={dec.x}
              y={dec.y}
              fontSize={dec.size}
              opacity={dec.opacity}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {dec.char}
            </text>
          ))}

          {/* Path trail (background — full path, dashed) */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(100,60,20,0.25)"
            strokeWidth="4"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />

          {/* Path trail (completed portion — solid) */}
          {firstPendingIndex !== 0 && (
            <path
              d={buildSmoothPath(stepPositions.slice(0, (firstPendingIndex >= 0 ? firstPendingIndex : localSteps.length) + 1))}
              fill="none"
              stroke="rgba(100,60,20,0.5)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}

          {/* Step markers */}
          {stepPositions.map((pos, i) => {
            const step = localSteps[i]
            const isCompleted = step.status === 'completed' || step.status === 'skipped'
            const isCurrent = i === firstPendingIndex
            const dayLabel = step.step_number
              ? `${step.step_number}`
              : step.scheduled_date
                ? new Date(step.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'short' })
                : `${i + 1}`

            return (
              <g key={step.task_id}>
                {/* Click area for current step */}
                {isCurrent && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={18}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => handleComplete(step.task_id)}
                  />
                )}

                {/* Pulse ring for current */}
                {isCurrent && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={14}
                    fill="none"
                    stroke="rgba(180,100,20,0.4)"
                    strokeWidth="2"
                    animate={{ r: [14, 18, 14], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isCompleted ? 10 : isCurrent ? 12 : 7}
                  fill={
                    isCompleted
                      ? 'rgba(80,50,20,0.7)'
                      : isCurrent
                        ? 'rgba(180,100,20,0.8)'
                        : 'rgba(160,120,60,0.2)'
                  }
                  stroke={
                    isCompleted
                      ? 'rgba(80,50,20,0.9)'
                      : isCurrent
                        ? 'rgba(200,130,30,1)'
                        : 'rgba(120,80,30,0.3)'
                  }
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                  className={isCurrent ? 'cursor-pointer' : ''}
                  onClick={() => isCurrent && handleComplete(step.task_id)}
                />

                {/* Check icon for completed */}
                {isCompleted && (
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="rgba(210,190,150,0.9)"
                  >
                    ✓
                  </text>
                )}

                {/* Day label */}
                <text
                  x={pos.x}
                  y={pos.y + (isCompleted || isCurrent ? 22 : 16)}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isCurrent ? 'rgba(140,70,10,0.8)' : 'rgba(100,60,20,0.4)'}
                  fontFamily="var(--font-lora)"
                >
                  {dayLabel}
                </text>
              </g>
            )
          })}

          {/* Start flag */}
          <text x={stepPositions[0]?.x - 18} y={stepPositions[0]?.y - 8} fontSize="14" opacity="0.4">🏁</text>

          {/* End treasure */}
          {stepPositions.length > 1 && (
            <text
              x={(stepPositions[stepPositions.length - 1]?.x || 0) + 16}
              y={(stepPositions[stepPositions.length - 1]?.y || 0) - 8}
              fontSize="16"
              opacity={completedCount === localSteps.length ? 0.8 : 0.25}
            >
              💰
            </text>
          )}
        </svg>
      </div>
    </div>
  )
}
