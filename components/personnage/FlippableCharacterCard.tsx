'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  const image = CLASS_IMAGES[character.character_class]
  const emoji = CLASS_EMOJIS[character.character_class] || '🃏'
  const rarityColor = RARITY_COLORS[character.rarity] || '#C4A35A'
  const rarityLabel = RARITY_LABELS[character.rarity] || character.rarity

  return (
    <>
      <div
        className="relative w-full max-w-sm cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Flip hint */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          <RotateCcw size={12} className="text-cream/20" />
          <span className="font-medieval text-[10px] text-cream/20">
            {isFlipped ? 'Voir le portrait' : 'Retourner'}
          </span>
        </div>

        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative aspect-[3/4.5] w-full"
        >
          {/* FRONT - Character Image */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              borderColor: `${rarityColor}40`,
              boxShadow: `0 0 40px ${rarityColor}15`,
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

            {/* Name overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
              <h2 className="font-cinzel text-2xl text-cream font-bold">{character.avatar_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-flex px-2 py-0.5 rounded text-[10px] font-medieval"
                  style={{ backgroundColor: `${rarityColor}25`, color: rarityColor }}
                >
                  {rarityLabel}
                </span>
                <span className="font-medieval text-[12px] text-cream/40">{emoji}</span>
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
              boxShadow: `0 0 40px ${rarityColor}15`,
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-b from-charcoal to-ink p-6 flex flex-col"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <span className="text-3xl">{emoji}</span>
                <h2 className="font-cinzel text-xl text-cream font-bold mt-2">
                  {character.avatar_name}
                </h2>
                <span
                  className="inline-flex px-2.5 py-0.5 rounded text-[11px] font-medieval mt-1"
                  style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
                >
                  {rarityLabel}
                </span>
              </div>

              {/* Description / Lore */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {character.description && (
                  <div>
                    <p className="font-medieval text-[10px] text-cream/20 tracking-widest uppercase mb-1">
                      Description
                    </p>
                    <p className="font-lora text-[13px] text-cream/50 leading-relaxed">
                      {character.description}
                    </p>
                  </div>
                )}

                {character.lore_text && (
                  <div>
                    <p className="font-medieval text-[10px] text-cream/20 tracking-widest uppercase mb-1">
                      Histoire
                    </p>
                    <p className="font-lora text-[13px] text-cream/40 leading-relaxed italic">
                      {character.lore_text}
                    </p>
                  </div>
                )}

                {/* Power */}
                <div>
                  <p className="font-medieval text-[10px] text-cream/20 tracking-widest uppercase mb-1">
                    Pouvoir
                  </p>
                  <p className="font-lora text-[13px] text-cream/50 leading-relaxed">
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
                className="mt-4 w-full py-3 rounded-xl font-cinzel text-[14px] transition-colors"
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
