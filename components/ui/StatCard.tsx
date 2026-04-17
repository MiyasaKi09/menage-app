import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  variant?: 'default' | 'hero' | 'tinted'
  color?: 'yellow' | 'orange' | 'blue' | 'green' | 'purple' | 'red'
  subtitle?: string
  className?: string
}

export function StatCard({ label, value, icon, variant = 'default', subtitle, className }: StatCardProps) {
  if (variant === 'hero') {
    return (
      <div className={cn(
        "rounded-3xl p-5 relative overflow-hidden",
        "bg-[length:200%_200%] animate-grad-shift",
        "bg-[linear-gradient(135deg,rgb(var(--deep-blue)),rgb(var(--deep-green)),rgb(var(--deep-blue)))]",
        "shadow-lg",
        className
      )}>
        <div className="absolute top-[-20px] right-[-20px] w-[120px] h-[120px] rounded-full bg-[radial-gradient(circle,hsla(30,60%,50%,0.15),transparent_70%)]" />
        <p className="font-sans text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1.5">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-5xl font-black leading-none tracking-tight" style={{ color: 'rgb(var(--character-glow))' }}>{value}</span>
          {subtitle && <span className="font-serif text-lg text-white/30 italic">{subtitle}</span>}
        </div>
        {icon && <div className="mt-2 text-lg opacity-40">{icon}</div>}
      </div>
    )
  }

  if (variant === 'tinted') {
    return (
      <div className={cn(
        "rounded-[20px] bg-green/5 border border-green/10 p-[18px_16px]",
        className
      )}>
        {icon && <div className="text-lg mb-1 opacity-60">{icon}</div>}
        <p className="font-sans text-[9px] font-bold text-green/50 uppercase tracking-[0.12em]">{label}</p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="font-serif text-4xl font-extrabold text-green/80 leading-none">{value}</span>
          {subtitle && <span className="font-serif text-[13px] text-green/50 italic">{subtitle}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "rounded-[20px] bg-card border border-border p-[18px_16px] shadow-sm",
      className
    )}>
      {icon && <div className="text-lg mb-1 opacity-60">{icon}</div>}
      <p className="font-sans text-[9px] font-bold text-foreground/30 uppercase tracking-[0.12em]">{label}</p>
      <div className="flex items-baseline gap-1 mt-1.5">
        <span className="font-serif text-4xl font-extrabold text-foreground leading-none">{value}</span>
        {subtitle && <span className="font-serif text-[13px] text-foreground/40 italic">{subtitle}</span>}
      </div>
    </div>
  )
}
