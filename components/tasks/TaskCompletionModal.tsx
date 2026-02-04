'use client'

import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { DiagonalStripe } from '@/components/ui/DiagonalStripe'

interface TaskCompletionModalProps {
  taskName: string
  points: number
  onClose: () => void
}

export function TaskCompletionModal({ taskName, points, onClose }: TaskCompletionModalProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Set window size for confetti
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Auto-hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="relative w-[90%] max-w-md bg-yellow border-4 border-black shadow-brutal-lg overflow-hidden"
      >
        <GrainOverlay opacity={0.06} />
        <DiagonalStripe
          position="top-left"
          colors={['#00b4ff', '#00e676', '#ffe14f', '#ff6b2c', '#ff3b5c']}
        />

        {/* Starburst */}
        <div className="relative z-10 h-48 flex items-center justify-center">
          <svg viewBox="0 0 200 200" width={180} height={180} className="animate-starburst-spin">
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 22.5) * Math.PI / 180
              const rayColors = ['#ff3b5c', '#ff6b2c', '#00e676', '#00b4ff']
              return (
                <polygon
                  key={i}
                  points={`100,100 ${100 + Math.cos(angle - 0.15) * 95},${100 + Math.sin(angle - 0.15) * 95} ${100 + Math.cos(angle + 0.15) * 95},${100 + Math.sin(angle + 0.15) * 95}`}
                  fill={rayColors[i % 4]}
                />
              )
            })}
            <circle cx="100" cy="100" r="28" fill="#ffe14f" />
            <text
              x="100"
              y="108"
              textAnchor="middle"
              fill="#080808"
              fontSize="28"
              fontWeight="900"
              fontFamily="Anton"
            >
              ✓
            </text>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 bg-black p-8 text-cream text-center border-t-4 border-black">
          <p className="font-space-mono text-xs opacity-50 uppercase tracking-wider mb-2">
            MISSION COMPLÉTÉE
          </p>
          <h2 className="font-anton text-3xl uppercase leading-tight mb-1">
            {taskName}
          </h2>
          <p className="font-anton text-3xl text-yellow uppercase">
            TERMINÉE !
          </p>

          {/* Points Display */}
          <div className="mt-6 p-4 bg-yellow text-black flex items-baseline justify-center gap-3">
            <span className="font-anton text-5xl">+{points}</span>
            <span className="font-anton text-xl">POINTS</span>
          </div>

          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={onClose}
          >
            CONTINUER
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
