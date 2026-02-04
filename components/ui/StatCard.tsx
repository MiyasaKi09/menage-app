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
    yellow: 'bg-yellow',
    orange: 'bg-orange',
    blue: 'bg-blue',
    green: 'bg-green',
    purple: 'bg-purple',
    red: 'bg-red',
  }

  return (
    <div className={cn(
      "relative border-4 border-black shadow-brutal overflow-hidden transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer",
      className
    )}>
      <GrainOverlay />
      <div className={cn("absolute top-0 left-0 right-0 h-2", colorClasses[color])} />
      <div className="relative p-4 bg-off-white">
        {icon && <div className="mb-1 text-2xl">{icon}</div>}
        <div className="font-space-mono font-bold text-3xl mb-0.5">{value}</div>
        <div className="font-outfit uppercase text-xs font-bold tracking-wide opacity-70">
          {label}
        </div>
      </div>
    </div>
  )
}
