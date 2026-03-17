'use client'

import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

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
          colors={['#D4AF37', '#B87333', '#8B2323', '#2E8B57', '#385FA8']}
        />
      )}

      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="relative w-[90%] max-w-md bg-gradient-to-br from-yellow to-orange/60 border border-yellow/25 rounded-xl shadow-golden-lg overflow-hidden"
      >
        <GrainOverlay opacity={0.06} />

        {/* Medieval shield/emblem */}
        <div className="relative z-10 h-48 flex items-center justify-center">
          <svg viewBox="0 0 200 200" width={160} height={160}>
            {/* Shield shape */}
            <path
              d="M100,20 L160,50 L160,120 Q160,170 100,190 Q40,170 40,120 L40,50 Z"
              fill="#D4AF37"
              stroke="#3E3023"
              strokeWidth="3"
            />
            <path
              d="M100,30 L150,55 L150,118 Q150,162 100,180 Q50,162 50,118 L50,55 Z"
              fill="#F2E6D2"
              stroke="#D4AF37"
              strokeWidth="1.5"
            />
            {/* Checkmark */}
            <path
              d="M75,105 L95,125 L130,80"
              fill="none"
              stroke="#2E8B57"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Crown on top */}
            <path
              d="M75,35 L85,20 L100,30 L115,20 L125,35"
              fill="#D4AF37"
              stroke="#3E3023"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 bg-charcoal p-8 text-cream text-center rounded-t-xl border-t border-yellow/20">
          <p className="font-medieval text-xs opacity-50 tracking-wider mb-2">
            Quete accomplie
          </p>
          <h2 className="font-cinzel text-3xl font-bold leading-tight mb-1">
            {taskName}
          </h2>
          <p className="font-cinzel text-2xl text-yellow font-bold">
            Terminee !
          </p>

          {/* Points Display */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow to-orange/80 text-black rounded-lg flex items-baseline justify-center gap-3">
            <span className="font-cinzel text-5xl font-bold">+{points}</span>
            <span className="font-cinzel text-xl font-semibold">or</span>
          </div>

          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={onClose}
          >
            Continuer
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
