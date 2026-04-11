'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { CharacterActionPopup } from './CharacterActionPopup'
import {
  CLASS_IMAGES,
  CLASS_EMOJIS,
  RARITY_COLORS,
  RARITY_LABELS,
} from '@/lib/characters/types'
import type { WeeklyCharacter } from '@/lib/characters/types'

interface FlippableCharacterCardProps {
  character: WeeklyCharacter
}

export function FlippableCharacterCard({ character }: FlippableCharacterCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAction, setShowAction] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const image = CLASS_IMAGES[character.character_class]
  const emoji = CLASS_EMOJIS[character.character_class] || '🃏'
  const rarityColor = RARITY_COLORS[character.rarity] || '#C4A35A'
  const rarityLabel = RARITY_LABELS[character.rarity] || character.rarity

  // Raw tilt values (normalized -0.5 to 0.5)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)

  // Spring-animated rotations
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 15 })
  const rotateY3d = useSpring(useTransform(tiltX, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 15 })
  const glareX = useTransform(tiltX, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(tiltY, [-0.5, 0.5], [0, 100])

  // Mouse tracking on entire page (not just card)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // Use distance from card center, clamped
      const x = Math.max(-0.5, Math.min(0.5, (e.clientX - centerX) / (rect.width * 1.5)))
      const y = Math.max(-0.5, Math.min(0.5, (e.clientY - centerY) / (rect.height * 1.5)))
      tiltX.set(x)
      tiltY.set(y)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [tiltX, tiltY])

  // Gyroscope / accelerometer for mobile
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const gamma = e.gamma || 0 // left-right tilt (-90 to 90)
    const beta = e.beta || 0   // front-back tilt (-180 to 180)
    // Normalize to -0.5 to 0.5 range, with limited range for comfort
    tiltX.set(Math.max(-0.5, Math.min(0.5, gamma / 40)))
    tiltY.set(Math.max(-0.5, Math.min(0.5, (beta - 45) / 40))) // offset by 45 deg for natural phone holding
  }, [tiltX, tiltY])

  useEffect(() => {
    // Check for permission API (iOS 13+)
    const startListening = () => {
      window.addEventListener('deviceorientation', handleOrientation)
    }

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS - needs user gesture, we'll listen on first tap
      const requestOnTap = () => {
        (DeviceOrientationEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') startListening()
          })
          .catch(() => {})
        window.removeEventListener('click', requestOnTap)
      }
      window.addEventListener('click', requestOnTap, { once: true })
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation)
        window.removeEventListener('click', requestOnTap)
      }
    } else {
      // Android / others
      startListening()
      return () => window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [handleOrientation])

  return (
    <>
      <div
        ref={cardRef}
        className="relative w-full max-w-sm cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Flip hint */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          <RotateCcw size={12} className="text-foreground/20" />
          <span className="font-sans text-[10px] text-foreground/20">
            {isFlipped ? 'Voir le portrait' : 'Retourner'}
          </span>
        </div>

        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
          style={{
            transformStyle: 'preserve-3d',
            rotateX,
            rotateY: isFlipped ? 180 : rotateY3d,
          }}
          className="relative aspect-[3/4.5] w-full"
        >
          {/* FRONT - Character Image */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 shadow-xl"
            style={{
              backfaceVisibility: 'hidden',
              borderColor: `${rarityColor}40`,
              boxShadow: `0 8px 40px ${rarityColor}20, 0 0 60px ${rarityColor}10`,
            }}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={character.avatar_name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: `linear-gradient(to bottom, ${rarityColor}20, ${rarityColor}05)` }}
              >
                <span className="text-8xl">{emoji}</span>
              </div>
            )}

            {/* Glare effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
                ),
              }}
            />

            {/* Name overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 pt-20"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}
            >
              <h2
                className="font-serif text-2xl font-bold drop-shadow-lg"
                style={{
                  color: '#fff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.3)',
                }}
              >
                {character.avatar_name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium backdrop-blur-sm"
                  style={{
                    backgroundColor: `${rarityColor}30`,
                    color: '#fff',
                    border: `1px solid ${rarityColor}40`,
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  {rarityLabel}
                </span>
                <span className="font-sans text-[13px] drop-shadow-md">{emoji}</span>
              </div>
            </div>
          </div>

          {/* BACK - Character Info */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderColor: `${rarityColor}40`,
              boxShadow: `0 8px 40px ${rarityColor}20`,
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-b from-charcoal to-ink p-6 flex flex-col"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <span className="text-3xl">{emoji}</span>
                <h2 className="font-serif text-xl text-foreground font-bold mt-2">
                  {character.avatar_name}
                </h2>
                <span
                  className="inline-flex px-2.5 py-0.5 rounded text-[11px] font-sans mt-1"
                  style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
                >
                  {rarityLabel}
                </span>
              </div>

              {/* Description / Lore */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {character.description && (
                  <div>
                    <p className="font-sans text-[10px] text-foreground/20 tracking-widest uppercase mb-1">
                      Description
                    </p>
                    <p className="font-sans text-[13px] text-foreground/50 leading-relaxed">
                      {character.description}
                    </p>
                  </div>
                )}

                {character.lore_text && (
                  <div>
                    <p className="font-sans text-[10px] text-foreground/20 tracking-widest uppercase mb-1">
                      Histoire
                    </p>
                    <p className="font-sans text-[13px] text-foreground/40 leading-relaxed italic">
                      {character.lore_text}
                    </p>
                  </div>
                )}

                {/* Power */}
                <div>
                  <p className="font-sans text-[10px] text-foreground/20 tracking-widest uppercase mb-1">
                    Pouvoir
                  </p>
                  <p className="font-sans text-[13px] text-foreground/50 leading-relaxed">
                    {character.power_description}
                  </p>
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAction(true)
                }}
                className="mt-4 w-full py-3 rounded-xl font-sans font-semibold text-[14px] transition-colors"
                style={{
                  backgroundColor: `${rarityColor}20`,
                  color: rarityColor,
                  border: `1px solid ${rarityColor}30`,
                }}
              >
                Action
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action popup */}
      <AnimatePresence>
        {showAction && (
          <CharacterActionPopup
            character={character}
            onClose={() => setShowAction(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
