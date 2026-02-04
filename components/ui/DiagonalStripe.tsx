import { cn } from '@/lib/utils/cn'

interface DiagonalStripeProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  colors?: string[]
  stripeWidth?: number
}

export function DiagonalStripe({
  position = 'top-right',
  colors = ['#ff3b5c', '#ff6b2c', '#ffe14f', '#00e676', '#00b4ff'],
  stripeWidth = 10
}: DiagonalStripeProps) {
  const isTop = position.includes('top')
  const isRight = position.includes('right')

  return (
    <div
      className={cn(
        "absolute overflow-hidden pointer-events-none",
        isTop ? '-top-5' : '-bottom-5',
        isRight ? '-right-10' : '-left-10'
      )}
      style={{
        width: '50%',
        height: '30%',
        transform: `rotate(${isRight ? '-35deg' : '35deg'})`,
        transformOrigin: isRight ? 'top right' : 'top left'
      }}
    >
      <div className="flex flex-col gap-0">
        {colors.map((color, i) => (
          <div
            key={i}
            style={{
              height: stripeWidth,
              backgroundColor: color,
              transform: 'scaleX(3)'
            }}
          />
        ))}
      </div>
    </div>
  )
}
