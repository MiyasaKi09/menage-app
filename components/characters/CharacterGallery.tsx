'use client'

import { CollectionCharacter } from '@/lib/characters/types'
import { CharacterCard } from './CharacterCard'
import { useState } from 'react'
import { CharacterDetailModal } from './CharacterDetailModal'

interface CharacterGalleryProps {
  characters: CollectionCharacter[]
}

export function CharacterGallery({ characters }: CharacterGalleryProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CollectionCharacter | null>(null)

  const collected = characters.filter(c => c.is_collected)
  const total = characters.length

  return (
    <>
      {/* Stats */}
      <div className="flex items-center gap-3 mb-6">
        <div className="font-cinzel text-sm text-cream/70">
          {collected.length}/{total} decouverts
        </div>
        <div className="flex-1 h-1 bg-cream/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow/60 rounded-full transition-all duration-500"
            style={{ width: `${(collected.length / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {characters.map((char) => (
          <CharacterCard
            key={char.avatar_id}
            character={char}
            isRevealed={true}
            isCollected={char.is_collected}
            size="sm"
            onClick={() => setSelectedCharacter(char)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </>
  )
}
