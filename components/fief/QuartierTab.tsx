'use client'

import { Camera, Box } from 'lucide-react'

export function QuartierTab() {
  return (
    <div className="space-y-6">
      {/* Room illustration placeholder */}
      <div className="relative aspect-square max-w-sm mx-auto bg-cream/[0.03] rounded-2xl border border-cream/[0.06] overflow-hidden">
        {/* Placeholder medieval room */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <div className="text-6xl mb-4 opacity-30">🏠</div>
          <h3 className="font-cinzel text-[16px] text-cream/50 mb-2">Votre quartier</h3>
          <p className="font-lora text-[13px] text-cream/25 max-w-[200px]">
            La vue 3D de votre chambre medievale sera bientot disponible
          </p>
        </div>

        {/* Room state overlay */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green/[0.15] border border-green/20">
          <span className="font-medieval text-[10px] text-green/60">Propre</span>
        </div>
      </div>

      {/* View mode toggles */}
      <div className="flex items-center justify-center gap-3">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cream/[0.06] border border-cream/[0.06] text-cream/50 font-medieval text-[12px]">
          <Camera size={14} />
          Photo
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cream/[0.04] border border-cream/[0.04] text-cream/25 font-medieval text-[12px]">
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
