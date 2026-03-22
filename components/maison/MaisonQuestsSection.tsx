'use client'

import { useMemo } from 'react'
import { QuestCard } from './QuestCard'
import { PeripetiesCarousel } from './PeripetiesCarousel'

interface MaisonQuestsSectionProps {
  tasks: any[]
  questFrequencies: string[]
}

export function MaisonQuestsSection({ tasks, questFrequencies }: MaisonQuestsSectionProps) {
  const questFreqSet = useMemo(() => new Set(questFrequencies), [questFrequencies])

  // Split: pick the ONE recurring task with the most steps as THE quest
  // Everything else (including other recurring tasks) → péripéties
  const { mainQuest, peripeties } = useMemo(() => {
    // Group recurring tasks by household_task_id
    const recurringGroups: Record<string, any[]> = {}
    const nonRecurring: any[] = []

    tasks.forEach((task) => {
      const freq = task.frequency_code || 'weekly'
      if (questFreqSet.has(freq)) {
        const key = task.household_task_id || task.task_id
        if (!recurringGroups[key]) recurringGroups[key] = []
        recurringGroups[key].push(task)
      } else {
        nonRecurring.push(task)
      }
    })

    // Pick the group with the most steps as the main quest
    const groups = Object.entries(recurringGroups)
      .map(([htId, steps]) => ({ htId, steps }))
      .sort((a, b) => b.steps.length - a.steps.length)

    let quest = null
    const extraPeripeties: any[] = []

    if (groups.length > 0) {
      // First group = the main quest
      const main = groups[0]
      const first = main.steps[0]
      quest = {
        householdTaskId: main.htId,
        questName: first.task_name || 'Quete',
        categoryEmoji: first.category_emoji || '⚔️',
        steps: main.steps
          .sort((a: any, b: any) => a.scheduled_date.localeCompare(b.scheduled_date))
          .map((s: any) => ({
            task_id: s.task_id,
            points: s.points,
            status: s.status,
            scheduled_date: s.scheduled_date,
          })),
        totalPoints: main.steps.reduce((sum: number, s: any) => sum + (s.points || 0), 0),
      }

      // Other recurring groups → flatten into péripéties
      for (let i = 1; i < groups.length; i++) {
        extraPeripeties.push(...groups[i].steps)
      }
    }

    return {
      mainQuest: quest,
      peripeties: [...extraPeripeties, ...nonRecurring],
    }
  }, [tasks, questFreqSet])

  if (!mainQuest && peripeties.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* La quête — carte au trésor unique */}
      {mainQuest && (
        <div className="space-y-3">
          <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase px-1">
            Quete de la semaine
          </p>
          <QuestCard
            questName={mainQuest.questName}
            categoryEmoji={mainQuest.categoryEmoji}
            steps={mainQuest.steps}
            totalPoints={mainQuest.totalPoints}
          />
        </div>
      )}

      {/* Péripéties en carousel */}
      {peripeties.length > 0 && (
        <PeripetiesCarousel tasks={peripeties} />
      )}
    </div>
  )
}
