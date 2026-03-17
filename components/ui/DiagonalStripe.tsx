import { cn } from '@/lib/utils/cn'

interface DiagonalStripeProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function DiagonalStripe({
  position = 'top-right',
}: DiagonalStripeProps) {
  const isTop = position.includes('top')
  const isRight = position.includes('right')

  return (
    <div
      className={cn(
        "absolute overflow-hidden pointer-events-none opacity-10",
        isTop ? '-top-6' : '-bottom-6',
        isRight ? '-right-6' : '-left-6'
      )}
      style={{
        width: '140px',
        height: '140px',
      }}
    >
      {/* Watercolor corner ornament - soft scrollwork */}
      <svg viewBox="0 0 100 100" width="140" height="140" className="opacity-50">
        {/* Decorative vine curves */}
        <path
          d="M10,90 Q10,10 90,10"
          fill="none"
          stroke="#C4A35A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M20,90 Q20,20 90,20"
          fill="none"
          stroke="#4A7A73"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M30,90 Q30,30 90,30"
          fill="none"
          stroke="#C88B7A"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        {/* Leaf-like accents */}
        <ellipse cx="15" cy="85" rx="3" ry="5" fill="#5A8060" opacity="0.4" transform="rotate(-30 15 85)" />
        <ellipse cx="85" cy="15" rx="3" ry="5" fill="#5A8060" opacity="0.4" transform="rotate(60 85 15)" />
        <ellipse cx="50" cy="50" rx="2" ry="4" fill="#C4A35A" opacity="0.3" transform="rotate(45 50 50)" />
        {/* Soft dot accents */}
        <circle cx="25" cy="75" r="1.5" fill="#C88B7A" opacity="0.3" />
        <circle cx="75" cy="25" r="1.5" fill="#4A7A73" opacity="0.3" />
      </svg>
    </div>
  )
}
