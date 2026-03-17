'use client'

import Image from 'next/image'
import { useCharacterTheme } from '@/components/providers/CharacterThemeProvider'
import { CLASS_EMOJIS, CLASS_IMAGES, RARITY_COLORS, RARITY_LABELS } from '@/lib/characters/types'

export function WeeklyCharacterHero() {
  const { character, power } = useCharacterTheme()

  if (!character) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl opacity-20 mb-4">🃏</div>
        <h2 className="font-cinzel text-xl text-cream/50">Aucun personnage cette semaine</h2>
        <p className="font-lora text-[13px] text-cream/25 mt-2">
          Rejoignez une cite pour recevoir votre premier personnage
        </p>
      </div>
    )
  }

  const charClass = character.character_class || ''
  const imageUrl = CLASS_IMAGES[charClass]
  const emoji = CLASS_EMOJIS[charClass] || '👤'
  const rarityColor = RARITY_COLORS[character.rarity] || RARITY_COLORS.common
  const rarityLabel = RARITY_LABELS[character.rarity] || 'Commun'
  const primary = character.color_theme?.primary || '196 163 90'

  return (
    <div>
      {/* Title */}
      <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase mb-6">
        Votre personnage cette semaine
      </p>

      {/* Hero card */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Image */}
        <div className="relative flex-shrink-0 self-center sm:self-start">
          <div
            className="absolute -inset-4 rounded-3xl blur-3xl opacity-15"
            style={{ backgroundColor: `rgb(${primary})` }}
          />
          {imageUrl ? (
            <div className="relative w-44 h-60 sm:w-52 sm:h-72 rounded-2xl overflow-hidden shadow-lg border border-cream/10">
              <Image
                src={imageUrl}
                alt={character.avatar_name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 176px, 208px"
                priority
              />
              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          ) : (
            <div
              className="w-44 h-60 sm:w-52 sm:h-72 rounded-2xl flex items-center justify-center shadow-lg border border-cream/10"
              style={{ background: `linear-gradient(to bottom, rgb(${primary} / 0.2), rgb(${primary} / 0.05))` }}
            >
              <span className="text-7xl">{emoji}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
          {/* Rarity */}
          <span
            className="inline-block self-center sm:self-start font-medieval text-[10px] px-3 py-1 rounded-full mb-3"
            style={{ color: rarityColor, backgroundColor: rarityColor + '15' }}
          >
            {rarityLabel}
          </span>

          {/* Name */}
          <h1 className="font-cinzel text-3xl sm:text-4xl text-cream font-semibold tracking-tight leading-tight">
            {character.avatar_name}
          </h1>

          {/* Power */}
          {power && (
            <div className="mt-5 p-4 rounded-xl bg-cream/[0.04] border border-cream/[0.06]">
              <p className="font-medieval text-[10px] text-cream/25 tracking-widest uppercase mb-1">
                Pouvoir
              </p>
              <p className="font-cinzel text-[15px] text-yellow/80">
                {character.power_description}
              </p>
            </div>
          )}

          {/* Lore */}
          {character.lore_text && (
            <p className="font-lora text-[13px] text-cream/30 italic leading-relaxed mt-5">
              &ldquo;{character.lore_text}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
