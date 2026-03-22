'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, animate } from 'framer-motion'

interface SwipeCarouselProps {
  children: ReactNode[]
  className?: string
}

export function SwipeCarousel({ children, className = '' }: SwipeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [scrollWidth, setScrollWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  const x = useMotionValue(0)
  const springX = useSpring(x, { damping: 30, stiffness: 300 })

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
        setScrollWidth(containerRef.current.scrollWidth)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [children.length])

  const maxDrag = Math.min(0, -(scrollWidth - containerWidth))

  const handleDragEnd = (_: any, info: { velocity: { x: number }; offset: { x: number } }) => {
    const velocity = info.velocity.x

    // Snap to nearest card
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('[data-carousel-item]')
      if (cards.length === 0) return

      let targetIndex = activeIndex
      if (velocity < -200 || info.offset.x < -50) {
        targetIndex = Math.min(activeIndex + 1, cards.length - 1)
      } else if (velocity > 200 || info.offset.x > 50) {
        targetIndex = Math.max(activeIndex - 1, 0)
      }

      const card = cards[targetIndex] as HTMLElement
      const targetX = Math.max(maxDrag, Math.min(0, -card.offsetLeft + 16))

      setActiveIndex(targetIndex)
      animate(x, targetX, { type: 'spring', damping: 30, stiffness: 300 })
    }
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        ref={containerRef}
        className="flex gap-3 cursor-grab active:cursor-grabbing"
        style={{ x: springX }}
        drag="x"
        dragConstraints={{ left: maxDrag, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {children.map((child, i) => (
          <div key={i} data-carousel-item className="flex-shrink-0">
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
export function CarouselCard({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const scale = useSpring(1, { damping: 20, stiffness: 300 })

  const handleClick = () => {
    if (onClick) {
      scale.set(1.05)
      setTimeout(() => {
        scale.set(1)
        onClick()
      }, 150)
    }
  }

  return (
    <motion.div
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ scale }}
      onTap={handleClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {children}
    </motion.div>
  )
}
