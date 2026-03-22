'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Camera, Box } from 'lucide-react'

const MedievalRoom = dynamic(
  () => import('./MedievalRoom').then(mod => ({ default: mod.MedievalRoom })),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square max-w-sm mx-auto bg-cream/[0.03] rounded-2xl border border-cream/[0.06] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-cream/20 border-t-cream/50 rounded-full animate-spin mx-auto" />
          <p className="font-lora text-[12px] text-cream/25">Chargement de la chambre...</p>
        </div>
      </div>
    ),
  }
)

export function QuartierTab() {
  const [viewMode, setViewMode] = useState<'3d' | 'photo'>('3d')

  return (
    <div className="space-y-6">
      {/* 3D Room */}
      <MedievalRoom />

      {/* View mode toggles */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setViewMode('photo')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medieval text-[12px] transition-colors ${
            viewMode === 'photo'
              ? 'bg-cream/[0.08] border border-cream/[0.1] text-cream/60'
              : 'bg-cream/[0.04] border border-cream/[0.04] text-cream/25'
          }`}
        >
          <Camera size={14} />
          Photo
        </button>
        <button
          onClick={() => setViewMode('3d')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medieval text-[12px] transition-colors ${
            viewMode === '3d'
              ? 'bg-cream/[0.08] border border-cream/[0.1] text-cream/60'
              : 'bg-cream/[0.04] border border-cream/[0.04] text-cream/25'
          }`}
        >
          <Box size={14} />
          Vue 3D
        </button>
      </div>

      {/* Configuration categories */}
      <div className="space-y-3">
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
          Configurer
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {['Fenetres', 'Meubles', 'Luminaire', 'Sols-Murs'].map((cat) => (
            <button
              key={cat}
              className="flex-shrink-0 px-3 py-2 rounded-lg bg-cream/[0.04] border border-cream/[0.06] text-cream/40 font-lora text-[12px] hover:bg-cream/[0.08] transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Item cards placeholder */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-24 rounded-xl bg-cream/[0.03] border border-cream/[0.06] flex items-center justify-center"
            >
              <div className="w-10 h-10 rounded-lg bg-cream/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
