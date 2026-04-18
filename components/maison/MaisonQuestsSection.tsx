'use client'

import { useMemo } from 'react'
import { QuestCard } from './QuestCard'
import { PeripetiesCarousel } from './PeripetiesCarousel'

interface MaisonQuestsSectionProps {
  corveeData: any[]
  peripeties: any[]
  userId: string
  householdId: string
  userPoints?: number
}

export function MaisonQuestsSection({ corveeData, peripeties, userId, householdId, userPoints = 0 }: MaisonQuestsSectionProps) {
  // Group corvee rows by corvee_id → one QuestCard per corvée
  // The RPC returns one row per step, so we group them
  const corvee = useMemo(() => {
    if (corveeData.length === 0) return null

    // Group by corvee_id, take the first one (only one corvée displayed)
    const groups: Record<string, any[]> = {}
    corveeData.forEach((row: any) => {
      const key = row.corvee_id
      if (!groups[key]) groups[key] = []
      groups[key].push(row)
    })

    // Pick the first corvée (most steps)
    const entries = Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
    if (entries.length === 0) return null

    const [, rows] = entries[0]
    const first = rows[0]

    return {
      questName: first.corvee_name || 'Corvee',
      categoryEmoji: first.corvee_emoji || '🧹',
      steps: rows
        .filter((r: any) => r.step_id) // exclude rows without steps (not yet generated)
        .sort((a: any, b: any) => a.step_number - b.step_number)
        .map((r: any) => ({
          task_id: r.step_id,
          points: r.step_points_earned || r.points_per_step || 10,
          status: r.step_status || 'pending',
          scheduled_date: '', // corvee steps don't have individual dates, use step_number as label
          step_number: r.step_number,
        })),
      totalPoints: rows.reduce((sum: number, r: any) => sum + (r.step_points_earned || r.points_per_step || 10), 0),
    }
  }, [corveeData])

  if (!corvee && peripeties.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* La corvée — carte au trésor unique */}
      {corvee && corvee.steps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'rgb(var(--primary)/0.12)' }} />
            <p className="font-sans text-[8px] font-black uppercase tracking-[0.35em]" style={{ color: 'rgb(var(--primary)/0.35)' }}>
              Corvée de la semaine
            </p>
            <div className="h-px flex-1" style={{ background: 'rgb(var(--primary)/0.12)' }} />
          </div>
          <QuestCard
            questName={corvee.questName}
            categoryEmoji={corvee.categoryEmoji}
            steps={corvee.steps}
            totalPoints={corvee.totalPoints}
          />
        </div>
      )}

      {/* Péripéties en carousel */}
      {peripeties.length > 0 && (
        <PeripetiesCarousel tasks={peripeties} userId={userId} householdId={householdId} userPoints={userPoints} />
      )}
    </div>
  )
}
