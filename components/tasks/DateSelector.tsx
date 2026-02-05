'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface DateSelectorProps {
  currentDate: string
}

export function DateSelector({ currentDate }: DateSelectorProps) {
  const router = useRouter()

  const navigate = (days: number) => {
    const date = new Date(currentDate + 'T12:00:00') // Noon to avoid timezone issues
    date.setDate(date.getDate() + days)
    const newDateStr = date.toISOString().split('T')[0]
    router.push(`/tasks/schedule?date=${newDateStr}`)
  }

  const goToToday = () => {
    router.push('/tasks/schedule')
  }

  // Check if we're viewing today
  const today = new Date().toISOString().split('T')[0]
  const isToday = currentDate === today

  // Format current date for display
  const displayDate = new Date(currentDate + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="bg-cream border-4 border-black p-4 shadow-brutal">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left: Previous Day Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 sm:flex-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-space-mono text-xs">JOUR PRÉCÉDENT</span>
        </Button>

        {/* Center: Current Date Display + Today Button */}
        <div className="flex flex-col items-center gap-2 sm:flex-[2]">
          <div className="flex items-center gap-2 font-space-mono text-sm opacity-70">
            <Calendar className="w-4 h-4" />
            <span className="capitalize">{displayDate}</span>
          </div>
          {!isToday && (
            <Button
              variant="default"
              size="sm"
              onClick={goToToday}
              className="font-space-mono text-xs"
            >
              AUJOURD'HUI
            </Button>
          )}
        </div>

        {/* Right: Next Day Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(1)}
          className="flex items-center justify-center gap-2 sm:flex-1"
        >
          <span className="font-space-mono text-xs">JOUR SUIVANT</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
