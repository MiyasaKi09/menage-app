import { cn } from '@/lib/utils/cn'
import { GrainOverlay } from './GrainOverlay'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: 'yellow' | 'orange' | 'blue' | 'green' | 'purple' | 'red'
  className?: string
}

export function StatCard({ label, value, icon, color = 'yellow', className }: StatCardProps) {
  const colorClasses = {
    yellow: 'bg-yellow/80',
    orange: 'bg-orange/80',
    blue: 'bg-blue/80',
    green: 'bg-green/80',
    purple: 'bg-purple/80',
    red: 'bg-red/80',
  }

  return (
    <div className={cn(
      "relative border-2 border-charcoal/20 rounded-lg shadow-brutal overflow-hidden transition-all hover:shadow-brutal-lg hover:-translate-y-0.5 cursor-pointer",
      className
    )}>
      <GrainOverlay />
      <div className={cn("absolute top-0 left-0 right-0 h-1.5 rounded-t-lg", colorClasses[color])} />
      <div className="relative p-4 bg-off-white">
        {icon && <div className="mb-1 text-2xl">{icon}</div>}
        <div className="font-cinzel font-bold text-3xl mb-0.5 text-charcoal">{value}</div>
        <div className="font-lora text-xs font-semibold tracking-wide opacity-70 text-charcoal">
          {label}
        </div>
      </div>
    </div>
  )
}
