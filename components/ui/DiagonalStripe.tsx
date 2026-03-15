import { cn } from '@/lib/utils/cn'

interface DiagonalStripeProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  colors?: string[]
  stripeWidth?: number
}

export function DiagonalStripe({
  position = 'top-right',
}: DiagonalStripeProps) {
  const isTop = position.includes('top')
  const isRight = position.includes('right')

  return (
    <div
      className={cn(
        "absolute overflow-hidden pointer-events-none opacity-15",
        isTop ? '-top-8' : '-bottom-8',
        isRight ? '-right-8' : '-left-8'
      )}
      style={{
        width: '120px',
        height: '120px',
      }}
    >
      {/* Medieval corner ornament */}
      <svg viewBox="0 0 100 100" width="120" height="120" className="opacity-60">
        {/* Decorative scrollwork */}
        <path
          d="M10,90 Q10,10 90,10"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2"
        />
        <path
          d="M20,90 Q20,20 90,20"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.5"
        />
        <path
          d="M30,90 Q30,30 90,30"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
        />
        {/* Fleur-de-lis accent */}
        <circle cx="50" cy="50" r="3" fill="#D4AF37" opacity="0.5" />
        <circle cx="15" cy="85" r="2" fill="#D4AF37" opacity="0.4" />
        <circle cx="85" cy="15" r="2" fill="#D4AF37" opacity="0.4" />
      </svg>
    </div>
  )
}
