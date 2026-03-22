'use client'

import { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, animate } from 'framer-motion'

export interface SwipeCarouselHandle {
  goToIndex: (index: number) => void
}

interface SwipeCarouselProps {
  children: ReactNode[]
  className?: string
  initialIndex?: number
  onActiveIndexChange?: (index: number) => void
}

const GAP = 12

export const SwipeCarousel = forwardRef<SwipeCarouselHandle, SwipeCarouselProps>(function SwipeCarousel({ children, className = '', initialIndex, onActiveIndexChange }, ref) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const [viewIndex, setViewIndex] = useState(initialIndex ?? 0)
  const hasInitialized = useRef(false)

  const x = useMotionValue(0)
  // Smoother spring — lower stiffness, higher damping for fluid feel
  const springX = useSpring(x, { damping: 35, stiffness: 200, mass: 0.8 })

  const cardWidth = wrapperWidth > 0 ? Math.floor((wrapperWidth - 2 * GAP) / 2.5) : 260

  useEffect(() => {
    const measure = () => {
      if (wrapperRef.current) setWrapperWidth(wrapperRef.current.offsetWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const totalWidth = children.length * cardWidth + (children.length - 1) * GAP
  const maxDrag = Math.min(0, -(totalWidth - wrapperWidth))

  const goToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, children.length - 1))
    // Center the card in the viewport
    const centerOffset = -(clamped * (cardWidth + GAP)) + (wrapperWidth / 2 - cardWidth / 2)
    const targetX = Math.max(maxDrag, Math.min(0, centerOffset))
    setViewIndex(clamped)
    onActiveIndexChange?.(clamped)
    animate(x, targetX, { type: 'spring', damping: 35, stiffness: 200, mass: 0.8 })
  }, [cardWidth, wrapperWidth, maxDrag, children.length, x, onActiveIndexChange])

  useImperativeHandle(ref, () => ({ goToIndex }), [goToIndex])

  // Center on initialIndex at mount
  useEffect(() => {
    if (wrapperWidth > 0 && initialIndex !== undefined && !hasInitialized.current) {
      hasInitialized.current = true
      const centerOffset = -(initialIndex * (cardWidth + GAP)) + (wrapperWidth / 2 - cardWidth / 2)
      const clampedX = Math.max(maxDrag, Math.min(0, centerOffset))
      x.set(clampedX)
      setViewIndex(initialIndex)
    }
  }, [wrapperWidth, initialIndex, cardWidth, maxDrag, x])

  const handleDragEnd = (_: any, info: { velocity: { x: number }; offset: { x: number } }) => {
    const velocity = info.velocity.x
    let targetIndex = viewIndex

    if (velocity < -300 || info.offset.x < -40) {
      targetIndex = Math.min(viewIndex + 1, children.length - 1)
    } else if (velocity > 300 || info.offset.x > 40) {
      targetIndex = Math.max(viewIndex - 1, 0)
    }

    goToIndex(targetIndex)
  }

  return (
    <div ref={wrapperRef} className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex cursor-grab active:cursor-grabbing"
        style={{ x: springX, gap: GAP }}
        drag="x"
        dragConstraints={{ left: maxDrag, right: 0 }}
        dragElastic={0.08}
        dragTransition={{ bounceStiffness: 200, bounceDamping: 30 }}
        onDragEnd={handleDragEnd}
      >
        {children.map((child, i) => (
          <div key={i} data-carousel-item className="flex-shrink-0" style={{ width: cardWidth }}>
            {child}
          </div>
        ))}
      </motion.div>

      {/* Dots */}
      {children.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => goToIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                i === viewIndex ? 'bg-cream/40' : 'bg-cream/10'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
})

// Card with click-to-zoom (pointer tracking to distinguish from drag)
export function CarouselCard({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const [isZooming, setIsZooming] = useState(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!onClick || !pointerStart.current) return
    const dx = Math.abs(e.clientX - pointerStart.current.x)
    const dy = Math.abs(e.clientY - pointerStart.current.y)
    pointerStart.current = null

    if (dx < 8 && dy < 8) {
      setIsZooming(true)
      setTimeout(() => {
        setIsZooming(false)
        onClick()
      }, 180)
    }
  }

  return (
    <motion.div
      className={`${className} ${onClick ? 'cursor-pointer' : ''} w-full`}
      animate={{ scale: isZooming ? 1.05 : 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {children}
    </motion.div>
  )
}
