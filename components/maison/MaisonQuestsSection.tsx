'use client'

import { useMemo } from 'react'
import { QuestPostIt } from './QuestPostIt'
import { PeripetiesCarousel } from './PeripetiesCarousel'
import { SwipeCarousel } from './SwipeCarousel'

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

  // Group quest tasks by household_task_id (same recurring task = one post-it with multiple steps)
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
        categoryName: first.category_name || '',
        steps: steps.map((s: any) => ({
          task_id: s.task_id,
          task_name: s.task_name,
          category_emoji: s.category_emoji,
          category_name: s.category_name,
          points: s.points,
          status: s.status,
          scheduled_date: s.scheduled_date,
          household_task_id: s.household_task_id,
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
      {/* Combined carousel: Quêtes post-its on left + regular flow */}
      {hasQuests && (
        <div className="space-y-3">
          <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase px-1">
            Quetes de la semaine
          </p>
          <SwipeCarousel>
            {groupedQuests.map((quest) => (
              <QuestPostIt
                key={quest.householdTaskId}
                questName={quest.questName}
                categoryEmoji={quest.categoryEmoji}
                categoryName={quest.categoryName}
                steps={quest.steps}
                totalPoints={quest.totalPoints}
              />
            ))}
          </SwipeCarousel>
        </div>
      )}

      {/* Péripéties section */}
      {hasPeripeties && (
        <PeripetiesCarousel tasks={peripeties} />
      )}

      {/* If all tasks are quêtes, show a subtle empty state for péripéties */}
      {hasQuests && !hasPeripeties && (
        <div className="text-center py-4">
          <p className="font-lora text-[12px] text-cream/15 italic">
            Pas de peripetie en cours
          </p>
        </div>
      )}
    </div>
  )
}
