'use client'

import { useState } from 'react'
import { DateSelector } from './DateSelector'
import { ScheduleTaskCard } from './ScheduleTaskCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { DiagonalStripe } from '@/components/ui/DiagonalStripe'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ScheduleTask {
  scheduled_date: string
  task_id: string
  task_name: string
  task_tip: string | null
  category_name: string
  category_emoji: string
  duration_minutes: number
  points: number
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  assigned_to_id: string | null
  assigned_to_name: string | null
  rollover_count: number
}

interface ScheduleViewProps {
  schedule: ScheduleTask[]
  householdId: string
  householdName: string
  userId: string
  currentDate: string
}

export function ScheduleView({
  schedule,
  householdId,
  householdName,
  userId,
  currentDate
}: ScheduleViewProps) {
  // Group tasks by date
  const tasksByDate = schedule.reduce((acc, task) => {
    if (!acc[task.scheduled_date]) {
      acc[task.scheduled_date] = []
    }
    acc[task.scheduled_date].push(task)
    return acc
  }, {} as Record<string, ScheduleTask[]>)

  // Helper to get date label (Aujourd'hui, Demain, or formatted date)
  const getDateLabel = (dateStr: string): string => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    if (dateStr === today) return 'Aujourd\'hui'
    if (dateStr === tomorrowStr) return 'Demain'

    const date = new Date(dateStr + 'T12:00:00') // Noon to avoid timezone issues
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  // Get sorted dates
  const sortedDates = Object.keys(tasksByDate).sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-purple to-[#1f0833] relative overflow-hidden">
      <GrainOverlay />
      <DiagonalStripe position="top-left" colors={['#ffe14f', '#ff6b2c', '#00b4ff']} />

      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="font-space-mono text-xs opacity-50 uppercase tracking-wider mb-1 text-cream">
              {householdName}
            </div>
            <h1 className="font-anton text-4xl md:text-5xl text-cream uppercase leading-none">
              PLANNING
            </h1>
            <p className="font-space-mono text-sm text-cream opacity-60 mt-2">
              Vue liste par jour
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/tasks">
              <Button variant="outline" size="sm">Vue Catégories</Button>
            </Link>
            <Link href="/tasks/history">
              <Button variant="outline" size="sm">Historique</Button>
            </Link>
          </div>
        </div>

        {/* Date Selector */}
        <DateSelector currentDate={currentDate} />

        {/* Schedule by Day */}
        {sortedDates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="font-anton text-2xl uppercase mb-2">Aucune tâche planifiée</h3>
              <p className="font-outfit opacity-70 mb-4">
                Toutes vos tâches sont à jour ! Profitez-en pour vous reposer.
              </p>
              <Link href="/tasks">
                <Button>Voir toutes les tâches</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => {
              const tasks = tasksByDate[date]
              const totalMinutes = tasks.reduce((sum, t) => sum + t.duration_minutes, 0)
              const completedCount = tasks.filter(t => t.status === 'completed').length
              const isToday = date === new Date().toISOString().split('T')[0]

              return (
                <Card key={date}>
                  <CardHeader className={`border-b-4 border-black ${
                    isToday ? 'bg-orange' : 'bg-yellow'
                  }`}>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <CardTitle className="font-anton text-2xl uppercase flex items-center gap-2">
                          {getDateLabel(date)}
                          {isToday && (
                            <span className="text-sm bg-black text-cream px-2 py-1 font-space-mono">
                              AUJOURD'HUI
                            </span>
                          )}
                        </CardTitle>
                        <p className="font-space-mono text-xs opacity-70 mt-1">
                          {tasks.length} tâche{tasks.length > 1 ? 's' : ''} · {totalMinutes} min · {completedCount}/{tasks.length} terminée{completedCount > 1 ? 's' : ''}
                        </p>
                      </div>
                      {completedCount === tasks.length && (
                        <div className="font-space-mono text-sm text-green bg-black px-3 py-1 uppercase">
                          ✓ JOUR TERMINÉ
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    {tasks.map(task => (
                      <ScheduleTaskCard
                        key={task.task_id}
                        task={task}
                        householdId={householdId}
                        userId={userId}
                      />
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
