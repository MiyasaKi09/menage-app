'use client'

import { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef, type ReactNode } from 'react'
import { motion, useMotionValue, animate, type PanInfo } from 'framer-motion'

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

  // Use a single motion value — no spring wrapper (avoids feedback loop on over-drag)
  const x = useMotionValue(0)

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

  const computeTargetX = useCallback((index: number) => {
    const centerOffset = -(index * (cardWidth + GAP)) + (wrapperWidth / 2 - cardWidth / 2)
    return Math.max(maxDrag, Math.min(0, centerOffset))
  }, [cardWidth, wrapperWidth, maxDrag])

  const goToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, children.length - 1))
    const targetX = computeTargetX(clamped)
    setViewIndex(clamped)
    onActiveIndexChange?.(clamped)
    animate(x, targetX, { type: 'spring', damping: 30, stiffness: 250, mass: 0.8 })
  }, [computeTargetX, children.length, x, onActiveIndexChange])

  useImperativeHandle(ref, () => ({ goToIndex }), [goToIndex])

  // Center on initialIndex at mount
  useEffect(() => {
    if (wrapperWidth > 0 && initialIndex !== undefined && !hasInitialized.current) {
      hasInitialized.current = true
      x.set(computeTargetX(initialIndex))
      setViewIndex(initialIndex)
    }
  }, [wrapperWidth, initialIndex, computeTargetX, x])

  const handleDragEnd = (_: any, info: PanInfo) => {
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
        className="flex cursor-grab active:cursor-grabbing select-none"
        style={{ x, gap: GAP }}
        drag="x"
        dragConstraints={{ left: maxDrag, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {children.map((child, i) => (
          <div key={i} data-carousel-item className="flex-shrink-0" style={{ width: cardWidth }}>
            {child}
          </div>
        ))}
      </motion.div>

      {/* Navigation: arrows + dots */}
      {children.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          {/* Left arrow */}
          <button
            onClick={() => goToIndex(viewIndex - 1)}
            disabled={viewIndex <= 0}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              viewIndex <= 0 ? 'text-foreground/10' : 'text-foreground/30 hover:text-foreground/50 hover:bg-white/80'
            }`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 1.5L3.5 5L6.5 8.5" /></svg>
          </button>

          {/* Dots or counter */}
          {children.length <= 8 ? (
            <div className="flex items-center gap-1.5">
              {children.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                    i === viewIndex ? 'bg-foreground/40' : 'bg-foreground/10'
                  }`}
                />
              ))}
            </div>
          ) : (
            <span className="font-sans text-[10px] text-foreground/25 tabular-nums">
              {viewIndex + 1}/{children.length}
            </span>
          )}

          {/* Right arrow */}
          <button
            onClick={() => goToIndex(viewIndex + 1)}
            disabled={viewIndex >= children.length - 1}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              viewIndex >= children.length - 1 ? 'text-foreground/10' : 'text-foreground/30 hover:text-foreground/50 hover:bg-white/80'
            }`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 1.5L6.5 5L3.5 8.5" /></svg>
          </button>
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
