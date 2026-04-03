'use client'

import { CollectionCharacter } from '@/lib/characters/types'
import { CharacterCard } from './CharacterCard'
import { useState } from 'react'
import { CharacterDetailModal } from './CharacterDetailModal'

interface CharacterGalleryProps {
  characters: CollectionCharacter[]
}

export function CharacterGallery({ characters }: CharacterGalleryProps) {
  const [selected, setSelected] = useState<CollectionCharacter | null>(null)

  const collected = characters.filter(c => c.is_collected).length
  const total = characters.length

  return (
    <>
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <span className="font-sans text-[11px] text-foreground/30">
          {collected}/{total}
        </span>
        <div className="flex-1 h-px bg-white/80 relative">
          <div
            className="absolute top-0 left-0 h-full bg-yellow/30 rounded-full transition-all duration-700"
            style={{ width: `${(collected / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {characters.map((char) => (
          <CharacterCard
            key={char.avatar_id}
            character={char}
            isCollected={char.is_collected}
            size="sm"
            onClick={() => setSelected(char)}
          />
        ))}
      </div>

      {selected && (
        <CharacterDetailModal character={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
