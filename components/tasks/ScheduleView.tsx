'use client'

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
  // Filter tasks for current date only
  const todayTasks = schedule.filter(task => task.scheduled_date === currentDate)

  // Calculate stats
  const totalMinutes = todayTasks.reduce((sum, t) => sum + t.duration_minutes, 0)
  const completedCount = todayTasks.filter(t => t.status === 'completed').length
  const isToday = currentDate === new Date().toISOString().split('T')[0]

  // Helper to get date label
  const getDateLabel = (): string => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    if (currentDate === today) return 'Aujourd\'hui'
    if (currentDate === tomorrowStr) return 'Demain'

    const date = new Date(currentDate + 'T12:00:00')
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <GrainOverlay opacity={0.08} />
      <DiagonalStripe position="top-left" />

      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="font-sans text-xs opacity-50 tracking-wider mb-1 text-foreground">
              {householdName}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground font-bold leading-none">
              Grimoire
            </h1>
            <p className="font-sans text-sm text-foreground opacity-60 mt-2">
              Vue liste par jour
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/tasks">
              <Button variant="outline" size="sm">Vue Categories</Button>
            </Link>
            <Link href="/tasks/history">
              <Button variant="outline" size="sm">Historique</Button>
            </Link>
          </div>
        </div>

        {/* Date Selector */}
        <DateSelector currentDate={currentDate} />

        {/* Schedule for Current Day */}
        {todayTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="font-serif text-2xl font-bold mb-2">Aucune quete planifiee</h3>
              <p className="font-sans opacity-70 mb-4">
                Toutes vos quetes sont a jour pour ce jour ! Profitez-en pour vous reposer.
              </p>
              <Link href="/tasks">
                <Button>Voir toutes les quetes</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className={`border-b border-charcoal/10 ${
              isToday ? 'bg-gradient-to-r from-orange/20 to-yellow/10' : 'bg-yellow/15'
            }`}>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <CardTitle className="font-serif text-2xl font-bold flex items-center gap-2">
                    {getDateLabel()}
                    {isToday && (
                      <span className="text-sm bg-foreground text-white px-2 py-1 font-sans rounded-md">
                        Aujourd&apos;hui
                      </span>
                    )}
                  </CardTitle>
                  <p className="font-sans text-xs opacity-70 mt-1">
                    {todayTasks.length} quete{todayTasks.length > 1 ? 's' : ''} · {totalMinutes} min · {completedCount}/{todayTasks.length} accomplie{completedCount > 1 ? 's' : ''}
                  </p>
                </div>
                {completedCount === todayTasks.length && (
                  <div className="font-sans text-sm text-green bg-green/10 px-3 py-1 rounded-md border border-green/20">
                    ✓ Jour termine
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {todayTasks.map(task => (
                <ScheduleTaskCard
                  key={task.task_id}
                  task={task}
                  householdId={householdId}
                  userId={userId}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
