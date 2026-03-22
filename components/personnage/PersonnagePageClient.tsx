'use client'

import { FlippableCharacterCard } from './FlippableCharacterCard'
import type { WeeklyCharacter } from '@/lib/characters/types'

interface PersonnagePageClientProps {
  character: WeeklyCharacter
}

export function PersonnagePageClient({ character }: PersonnagePageClientProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 pb-24">
      <FlippableCharacterCard character={character} />
    </div>
  )
}
