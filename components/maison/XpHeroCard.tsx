'use client'

import { useState, useEffect, useRef } from 'react'
import { Flame } from 'lucide-react'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

function AnimNum({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const targetRef = useRef(value)

  useEffect(() => {
    targetRef.current = value
    let frame: number
    const tick = () => {
      setDisplay(prev => {
        const diff = targetRef.current - prev
        if (Math.abs(diff) < 0.5) return targetRef.current
        frame = requestAnimationFrame(tick)
        return prev + diff * 0.12
      })
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{Math.round(display)}</>
}

interface XpHeroCardProps {
  dailyXp: number
  totalXp: number
  done: number
  total: number
  streak: number
  level: number
  levelName: string
  levelProgress: number
  habitants: number
  habitantInitials: string[]
}

export function XpHeroCard({
  dailyXp, totalXp, done, total, streak,
  level, levelName, levelProgress, habitants, habitantInitials,
}: XpHeroCardProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 gap-2">

      {/* ── XP Hero Card — cinematic ─────────────────────── */}
      <div
        className="col-span-2 rounded-[28px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgb(var(--deep-blue)) 0%, rgb(var(--deep-green)) 65%, rgb(var(--deep-blue)) 100%)',
          backgroundSize: '200% 200%',
          animation: 'grad-shift 8s ease infinite',
          boxShadow: '0 24px 80px rgb(var(--deep-blue)/0.6), 0 2px 0 inset rgb(255 255 255/0.04)',
        }}
      >
        <GrainOverlay opacity={0.045} />

        {/* Cinematic glow orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--character-glow)/0.18), transparent 70%)' }} />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--primary)/0.12), transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgb(var(--character-glow)/0.04), transparent 70%)' }} />

        {/* Top highlight arc */}
        <div className="absolute top-0 left-12 right-12 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--character-glow)/0.5), transparent)' }} />

        <div className="relative z-10 px-5 pt-6 pb-5">
          {/* Label row */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-sans text-[8px] font-black text-white/20 uppercase tracking-[0.35em]">
              Expérience du jour
            </p>
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ background: 'rgb(var(--yellow)/0.1)', border: '1px solid rgb(var(--yellow)/0.2)' }}
            >
              <Flame size={11} strokeWidth={1.5} style={{ color: 'rgb(var(--yellow))' }} />
              <span className="font-sans text-[11px] font-bold" style={{ color: 'rgb(var(--yellow))' }}>
                {streak}j
              </span>
            </div>
          </div>

          {/* Massive XP number — Oryzo scale */}
          <div className="flex items-end gap-3">
            <span
              className="font-serif font-black leading-[0.84] tracking-[-0.04em]"
              style={{
                fontSize: 'clamp(80px, 23vw, 108px)',
                color: 'rgb(var(--character-glow))',
                textShadow: '0 0 60px rgb(var(--character-glow)/0.45), 0 0 120px rgb(var(--character-glow)/0.18)',
              }}
            >
              <AnimNum value={dailyXp} />
            </span>
            <div className="flex flex-col gap-0.5 mb-3">
              <span className="font-serif text-[14px] italic leading-none" style={{ color: 'rgb(255 255 255/0.16)' }}>xp</span>
              <span className="font-sans text-[8px] tracking-wide" style={{ color: 'rgb(255 255 255/0.10)' }}>{totalXp} total</span>
            </div>
          </div>

          {/* Thin cinematic progress bar */}
          <div className="mt-5 space-y-1.5">
            <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgb(255 255 255/0.05)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, rgb(var(--green)/0.7), rgb(var(--yellow)))',
                  boxShadow: '0 0 12px rgb(var(--yellow)/0.6)',
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-[8px]" style={{ color: 'rgb(255 255 255/0.14)' }}>{done}/{total} quêtes</span>
              <span className="font-sans text-[8px] font-semibold" style={{ color: 'rgb(var(--yellow)/0.35)' }}>{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Level Card ─── */}
      <div
        className="rounded-[22px] p-[18px_16px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgb(var(--yellow)/0.09), rgb(var(--yellow)/0.03))',
          border: '1px solid rgb(var(--yellow)/0.15)',
          boxShadow: '0 2px 16px rgb(var(--yellow)/0.06)',
        }}
      >
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--yellow)/0.12), transparent 70%)' }} />
        <p
          className="font-sans text-[8px] font-black uppercase tracking-[0.2em]"
          style={{ color: 'rgb(var(--yellow)/0.5)' }}
        >
          Niveau
        </p>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span
            className="font-serif text-4xl font-extrabold leading-none"
            style={{ color: 'rgb(var(--charcoal))', textShadow: '0 0 20px rgb(var(--yellow)/0.15)' }}
          >
            {level}
          </span>
          <span className="font-serif text-[12px] italic" style={{ color: 'rgb(var(--yellow)/0.7)' }}>{levelName}</span>
        </div>
        <div className="mt-3 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgb(var(--yellow)/0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${levelProgress}%`,
              background: 'linear-gradient(90deg, rgb(var(--yellow)/0.5), rgb(var(--yellow)))',
              boxShadow: '0 0 8px rgb(var(--yellow)/0.4)',
            }}
          />
        </div>
      </div>

      {/* ── Village Card ─── */}
      <div
        className="rounded-[22px] p-[18px_16px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgb(var(--deep-green)/0.12), rgb(var(--green)/0.04))',
          border: '1px solid rgb(var(--green)/0.15)',
          boxShadow: '0 2px 16px rgb(var(--green)/0.06)',
        }}
      >
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--green)/0.18), transparent 70%)' }} />
        <p
          className="font-sans text-[8px] font-black uppercase tracking-[0.2em]"
          style={{ color: 'rgb(var(--green)/0.6)' }}
        >
          Village
        </p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span
            className="font-serif text-4xl font-extrabold leading-none"
            style={{ color: 'rgb(var(--charcoal))' }}
          >
            {habitants}
          </span>
          <span className="font-serif text-[12px] italic" style={{ color: 'rgb(var(--green)/0.7)' }}>
            hab.
          </span>
        </div>
        <div className="mt-3 flex">
          {habitantInitials.slice(0, 3).map((initial, i) => (
            <div
              key={i}
              className="w-[26px] h-[26px] rounded-[9px] flex items-center justify-center font-sans text-[10px] font-extrabold"
              style={{
                background: i === 0
                  ? 'rgb(var(--yellow)/0.22)'
                  : i === 1
                    ? 'rgb(var(--purple)/0.22)'
                    : 'rgb(var(--blue)/0.22)',
                border: '2px solid rgb(var(--background))',
                color: i === 0
                  ? 'rgb(var(--yellow))'
                  : i === 1
                    ? 'rgb(var(--purple))'
                    : 'rgb(var(--blue))',
                marginLeft: i > 0 ? -6 : 0,
                zIndex: 3 - i,
              }}
            >
              {initial}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
