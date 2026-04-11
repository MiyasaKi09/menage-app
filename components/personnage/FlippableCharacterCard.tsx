'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { RotateCcw, Sparkles, Shield, Zap, Clock } from 'lucide-react'
import { CharacterActionPopup } from './CharacterActionPopup'
import {
  CLASS_IMAGES,
  CLASS_EMOJIS,
  RARITY_COLORS,
  RARITY_LABELS,
} from '@/lib/characters/types'
import type { WeeklyCharacter } from '@/lib/characters/types'

const POWER_ICONS: Record<string, typeof Sparkles> = {
  category_bonus: Sparkles,
  point_multiplier: Zap,
  time_reduction: Clock,
  streak_shield: Shield,
}

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
  const PowerIcon = POWER_ICONS[character.power_type] || Sparkles

  // Raw tilt values (normalized -0.5 to 0.5)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)

  // Spring-animated rotations
  const springConfig = { stiffness: 150, damping: 15 }
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [12, -12]), springConfig)
  const rotateY3d = useSpring(useTransform(tiltX, [-0.5, 0.5], [-12, 12]), springConfig)
  const glareX = useTransform(tiltX, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(tiltY, [-0.5, 0.5], [0, 100])

  // Flip rotation as spring for smooth combining
  const flipTarget = useMotionValue(0)
  const flipRotateY = useSpring(flipTarget, { stiffness: 100, damping: 20 })

  useEffect(() => {
    flipTarget.set(isFlipped ? 180 : 0)
  }, [isFlipped, flipTarget])

  // Combined Y rotation = flip + tilt
  const combinedRotateY = useTransform(
    [flipRotateY, rotateY3d],
    ([flip, tilt]: number[]) => flip + tilt
  )

  // Mouse tracking on entire page
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
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
    const gamma = e.gamma || 0
    const beta = e.beta || 0
    tiltX.set(Math.max(-0.5, Math.min(0.5, gamma / 40)))
    tiltY.set(Math.max(-0.5, Math.min(0.5, (beta - 45) / 40)))
  }, [tiltX, tiltY])

  useEffect(() => {
    const startListening = () => {
      window.addEventListener('deviceorientation', handleOrientation)
    }

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const requestOnTap = () => {
        (DeviceOrientationEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') startListening()
          })
          .catch(() => {})
      }
      window.addEventListener('click', requestOnTap, { once: true })
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation)
        window.removeEventListener('click', requestOnTap)
      }
    } else {
      startListening()
      return () => window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [handleOrientation])

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if clicking a button
    if ((e.target as HTMLElement).closest('button')) return
    setIsFlipped(!isFlipped)
  }

  return (
    <>
      <div
        ref={cardRef}
        className="relative w-full max-w-sm cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={handleCardClick}
      >
        {/* Flip hint */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          <RotateCcw size={12} className="text-foreground/20" />
          <span className="font-sans text-[10px] text-foreground/20">
            {isFlipped ? 'Voir le portrait' : 'Retourner'}
          </span>
        </div>

        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            rotateX,
            rotateY: combinedRotateY,
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
            {/* Background with subtle pattern */}
            <div
              className="absolute inset-0 p-5 flex flex-col"
              style={{
                background: `linear-gradient(145deg, #1a1714 0%, #2d2520 40%, #1a1714 100%)`,
              }}
            >
              {/* Decorative top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)` }}
              />

              {/* Header */}
              <div className="text-center mb-4 pt-2">
                <span className="text-3xl">{emoji}</span>
                <h2 className="font-serif text-xl text-white/90 font-bold mt-2">
                  {character.avatar_name}
                </h2>
                <span
                  className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium mt-1.5"
                  style={{ backgroundColor: `${rarityColor}25`, color: rarityColor, border: `1px solid ${rarityColor}30` }}
                >
                  {rarityLabel}
                </span>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: `${rarityColor}20` }} />
                <div style={{ color: `${rarityColor}60` }}><PowerIcon size={14} /></div>
                <div className="flex-1 h-px" style={{ background: `${rarityColor}20` }} />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {/* Power - highlighted */}
                <div
                  className="rounded-xl p-3.5"
                  style={{ background: `${rarityColor}10`, border: `1px solid ${rarityColor}15` }}
                >
                  <p className="font-sans text-[10px] tracking-widest uppercase mb-1.5" style={{ color: rarityColor }}>
                    Pouvoir
                  </p>
                  <p className="font-sans text-[14px] text-white/80 font-medium leading-relaxed">
                    {character.power_description}
                  </p>
                </div>

                {/* Lore */}
                {character.lore_text && (
                  <div className="px-1">
                    <p className="font-sans text-[10px] text-white/20 tracking-widest uppercase mb-1.5">
                      Histoire
                    </p>
                    <p className="font-sans text-[12px] text-white/35 leading-relaxed italic">
                      {character.lore_text}
                    </p>
                  </div>
                )}

                {/* Description */}
                {character.description && (
                  <div className="px-1">
                    <p className="font-sans text-[10px] text-white/20 tracking-widest uppercase mb-1.5">
                      Description
                    </p>
                    <p className="font-sans text-[12px] text-white/35 leading-relaxed">
                      {character.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action button */}
              <button
                onClick={() => setShowAction(true)}
                className="mt-3 w-full py-3 rounded-xl font-sans font-semibold text-[14px] transition-all hover:brightness-125 active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${rarityColor}30, ${rarityColor}15)`,
                  color: rarityColor,
                  border: `1px solid ${rarityColor}30`,
                }}
              >
                <PowerIcon size={15} />
                Utiliser le pouvoir
              </button>
            </div>

            {/* Glare on back too */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([x, y]) => `radial-gradient(circle at ${100 - (x as number)}% ${y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
                ),
              }}
            />
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
