'use client'

import { useState, useRef } from 'react'
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

  // 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })
  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isFlipped) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <>
      <div
        ref={cardRef}
        className="relative w-full max-w-sm cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 180 : rotateY,
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
