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

  // Split tasks by type
  const { quests, peripeties } = useMemo(() => {
    const questTasks: any[] = []
    const peripetieTasks: any[] = []

    tasks.forEach((task) => {
      const freq = task.frequency_code || 'weekly'
      if (questFreqSet.has(freq)) {
        questTasks.push(task)
      } else {
        peripetieTasks.push(task)
      }
    })

    return { quests: questTasks, peripeties: peripetieTasks }
  }, [tasks, questFreqSet])

  // Group quest tasks by household_task_id (same recurring task = one path)
  const groupedQuests = useMemo(() => {
    const groups: Record<string, any[]> = {}

    quests.forEach((task) => {
      const key = task.household_task_id || task.task_id
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })

    return Object.entries(groups).map(([htId, steps]) => {
      const first = steps[0]
      return {
        householdTaskId: htId,
        questName: first.task_name || 'Quete',
        categoryEmoji: first.category_emoji || '⚔️',
        steps: steps
          .sort((a: any, b: any) => a.scheduled_date.localeCompare(b.scheduled_date))
          .map((s: any) => ({
            task_id: s.task_id,
            points: s.points,
            status: s.status,
            scheduled_date: s.scheduled_date,
          })),
        totalPoints: steps.reduce((sum: number, s: any) => sum + (s.points || 0), 0),
      }
    })
  }, [quests])

  const hasQuests = groupedQuests.length > 0
  const hasPeripeties = peripeties.length > 0

  if (!hasQuests && !hasPeripeties) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Au-dessus : Quêtes en chemin d'étapes */}
      {hasQuests && (
        <div className="space-y-3">
          <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase px-1">
            Quetes de la semaine
          </p>
          <div className="space-y-2">
            {groupedQuests.map((quest) => (
              <QuestCard
                key={quest.householdTaskId}
                questName={quest.questName}
                categoryEmoji={quest.categoryEmoji}
                steps={quest.steps}
                totalPoints={quest.totalPoints}
              />
            ))}
          </div>
        </div>
      )}

      {/* En-dessous : Carousel péripéties (2 + 2 demi) */}
      {hasPeripeties && (
        <PeripetiesCarousel tasks={peripeties} />
      )}
    </div>
  )
}
