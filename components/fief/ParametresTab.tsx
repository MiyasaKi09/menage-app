'use client'

import { useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'

interface ParametresTabProps {
  householdId: string
}

// Placeholder rooms data - will come from DB once migration is applied
const defaultRooms = [
  { id: '1', name: 'Salon', room_type: 'living', surface_m2: 25 },
  { id: '2', name: 'Cuisine', room_type: 'kitchen', surface_m2: 12 },
  { id: '3', name: 'Chambre', room_type: 'bedroom', surface_m2: 15 },
  { id: '4', name: 'Salle de bain', room_type: 'bathroom', surface_m2: 8 },
]

export function ParametresTab(_props: ParametresTabProps) {
  const [rooms] = useState(defaultRooms)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom)

  return (
    <div className="space-y-6">
      {/* Rooms list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
            Pieces
          </p>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow/[0.1] border border-yellow/20 text-yellow/70 font-sans text-[11px] hover:bg-yellow/[0.15] transition-colors">
            <Plus size={12} />
            Ajouter
          </button>
        </div>

        <div className="space-y-1">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
              className={`w-full flex items-center justify-between py-3 px-3 rounded-lg transition-colors ${
                selectedRoom === room.id
                  ? 'bg-white/80 border border-border'
                  : 'hover:bg-white/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center">
                  <span className="text-sm">
                    {room.room_type === 'kitchen' ? '🍳' : room.room_type === 'bathroom' ? '🚿' : room.room_type === 'bedroom' ? '🛏️' : '🛋️'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-sans font-semibold text-[13px] text-foreground/70">{room.name}</p>
                  <p className="font-sans text-[11px] text-foreground/25">{room.surface_m2} m²</p>
                </div>
              </div>
              <ChevronRight
                size={14}
                className={`text-foreground/20 transition-transform ${selectedRoom === room.id ? 'rotate-90' : ''}`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Room detail */}
      {selectedRoomData && (
        <div className="space-y-4 bg-white/40 rounded-xl border border-border/60 p-4">
          <h3 className="font-sans font-semibold text-[15px] text-foreground/70">{selectedRoomData.name}</h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="font-sans text-[10px] text-foreground/25 tracking-widest uppercase">
                Nom
              </label>
              <input
                type="text"
                defaultValue={selectedRoomData.name}
                className="w-full bg-white/60 border border-border/60 rounded-lg px-3 py-2 text-foreground/60 font-sans text-[13px] focus:outline-none focus:border-yellow/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-[10px] text-foreground/25 tracking-widest uppercase">
                Surface (m²)
              </label>
              <input
                type="number"
                defaultValue={selectedRoomData.surface_m2}
                className="w-full bg-white/60 border border-border/60 rounded-lg px-3 py-2 text-foreground/60 font-sans text-[13px] focus:outline-none focus:border-yellow/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-[10px] text-foreground/25 tracking-widest uppercase">
                Configuration
              </label>
              <div className="flex flex-wrap gap-2">
                {['Petit cote', 'Grand cote', 'Central'].map((config) => (
                  <button
                    key={config}
                    className="px-3 py-1.5 rounded-lg bg-white/60 border border-border/60 text-foreground/40 font-sans text-[12px] hover:bg-white transition-colors"
                  >
                    {config}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-[10px] text-foreground/25 tracking-widest uppercase">
                Materiau
              </label>
              <div className="flex flex-wrap gap-2">
                {['Parquet', 'Carrelage', 'Moquette', 'Pierre'].map((mat) => (
                  <button
                    key={mat}
                    className="px-3 py-1.5 rounded-lg bg-white/60 border border-border/60 text-foreground/40 font-sans text-[12px] hover:bg-white transition-colors"
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
