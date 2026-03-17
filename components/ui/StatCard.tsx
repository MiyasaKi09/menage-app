import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: 'yellow' | 'orange' | 'blue' | 'green' | 'purple' | 'red'
  className?: string
}

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-2xl bg-cream/[0.06] backdrop-blur-sm border border-cream/[0.08] p-4 text-center",
      className
    )}>
      {icon && <div className="text-lg mb-1 opacity-60">{icon}</div>}
      <div className="font-cinzel font-semibold text-2xl text-cream">{value}</div>
      <div className="font-lora text-[11px] text-cream/35 mt-0.5">{label}</div>
    </div>
  )
}
