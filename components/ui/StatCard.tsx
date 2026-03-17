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
    yellow: 'bg-yellow/60',
    orange: 'bg-orange/60',
    blue: 'bg-blue/60',
    green: 'bg-green/60',
    purple: 'bg-purple/60',
    red: 'bg-red/60',
  }

  return (
    <div className={cn(
      "relative border border-charcoal/12 rounded-lg shadow-watercolor overflow-hidden transition-all hover:shadow-watercolor-lg hover:-translate-y-0.5 cursor-pointer",
      className
    )}>
      <GrainOverlay />
      <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-lg", colorClasses[color])} />
      <div className="relative p-4 bg-off-white">
        {icon && <div className="mb-1 text-2xl">{icon}</div>}
        <div className="font-cinzel font-semibold text-3xl mb-0.5 text-charcoal">{value}</div>
        <div className="font-lora text-xs font-medium tracking-wide opacity-60 text-charcoal">
          {label}
        </div>
      </div>
    </div>
  )
}
