'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, animate } from 'framer-motion'

interface SwipeCarouselProps {
  children: ReactNode[]
  className?: string
  initialIndex?: number // Center on this card index at mount
}

const GAP = 12 // gap-3 = 12px

export function SwipeCarousel({ children, className = '', initialIndex }: SwipeCarouselProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState(initialIndex ?? 0)
  const isDragging = useRef(false)
  const hasInitialized = useRef(false)

  const x = useMotionValue(0)
  const springX = useSpring(x, { damping: 30, stiffness: 300 })

  // Card width: show 2 full cards + 2 half cards on edges
  const cardWidth = wrapperWidth > 0 ? Math.floor((wrapperWidth - 2 * GAP) / 2.5) : 260

  useEffect(() => {
    const measure = () => {
      if (wrapperRef.current) {
        setWrapperWidth(wrapperRef.current.offsetWidth)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Center on initialIndex once we have dimensions
  useEffect(() => {
    if (wrapperWidth > 0 && initialIndex !== undefined && !hasInitialized.current) {
      hasInitialized.current = true
      const centerOffset = -(initialIndex * (cardWidth + GAP)) + (wrapperWidth / 2 - cardWidth / 2)
      const totalW = children.length * cardWidth + (children.length - 1) * GAP
      const maxD = Math.min(0, -(totalW - wrapperWidth))
      const clampedX = Math.max(maxD, Math.min(0, centerOffset))
      x.set(clampedX)
    }
  }, [wrapperWidth, initialIndex, cardWidth, children.length, x])

  const totalWidth = children.length * cardWidth + (children.length - 1) * GAP
  const maxDrag = Math.min(0, -(totalWidth - wrapperWidth))

  const handleDragStart = () => {
    isDragging.current = true
  }

  const handleDragEnd = (_: any, info: { velocity: { x: number }; offset: { x: number } }) => {
    // Keep isDragging true briefly so click handlers can check it
    setTimeout(() => { isDragging.current = false }, 50)

    const velocity = info.velocity.x
    let targetIndex = activeIndex

    if (velocity < -200 || info.offset.x < -50) {
      targetIndex = Math.min(activeIndex + 1, children.length - 1)
    } else if (velocity > 200 || info.offset.x > 50) {
      targetIndex = Math.max(activeIndex - 1, 0)
    }

    const targetX = Math.max(maxDrag, Math.min(0, -(targetIndex * (cardWidth + GAP))))
    setActiveIndex(targetIndex)
    animate(x, targetX, { type: 'spring', damping: 30, stiffness: 300 })
  }

  return (
    <div ref={wrapperRef} className={`overflow-hidden ${className}`}>
      <motion.div
        ref={containerRef}
        className="flex cursor-grab active:cursor-grabbing"
        style={{ x: springX, gap: GAP }}
        drag="x"
        dragConstraints={{ left: maxDrag, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children.map((child, i) => (
          <div
            key={i}
            data-carousel-item
            className="flex-shrink-0"
            style={{ width: cardWidth }}
          >
            {child}
          </div>
        ))}
      </motion.div>

      {/* Dots indicator */}
      {children.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {children.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                i === activeIndex ? 'bg-cream/40' : 'bg-cream/10'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Wrapper for individual cards with click-to-zoom
// Uses pointer events to distinguish drag from tap (fixes Framer Motion drag/tap conflict)
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

    // If pointer moved less than 8px → it's a tap, not a drag
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
