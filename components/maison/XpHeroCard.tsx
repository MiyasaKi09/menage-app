'use client'

import { useState, useEffect, useRef } from 'react'
import { Flame } from 'lucide-react'

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
    <div className="grid grid-cols-2 gap-2.5">

      {/* ── XP Hero Card ─────────────────────── */}
      <div
        className="col-span-2 rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgb(var(--deep-blue)), rgb(var(--deep-green)) 50%, rgb(var(--deep-blue)))',
          backgroundSize: '200% 200%',
          animation: 'grad-shift 8s ease infinite',
          boxShadow: '0 8px 40px rgb(var(--deep-blue)/0.5), 0 2px 0 inset rgb(255 255 255/0.04)',
        }}
      >
        {/* Glow orbs — large & vivid */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--character-glow)/0.25), transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-8 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--yellow)/0.18), transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgb(var(--primary)/0.07), transparent 70%)' }} />

        {/* Subtle top highlight line */}
        <div className="absolute top-0 left-8 right-8 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--character-glow)/0.4), transparent)' }} />

        <div className="flex justify-between items-end relative">
          <div>
            <p className="font-sans text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-2">
              Expérience du jour
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="font-serif font-black leading-none tracking-tight"
                style={{
                  fontSize: 'clamp(48px, 14vw, 64px)',
                  color: 'rgb(var(--character-glow))',
                  textShadow: '0 0 40px rgb(var(--character-glow)/0.5), 0 0 80px rgb(var(--character-glow)/0.2)',
                }}
              >
                <AnimNum value={dailyXp} />
              </span>
              <span className="font-serif text-xl text-white/25 italic">xp</span>
            </div>
            <p className="font-sans text-[11px] text-white/20 mt-1.5">
              Total : <span className="text-white/35 font-semibold">{totalXp} xp</span>
            </p>
          </div>

          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-2"
            style={{
              background: 'rgb(var(--yellow)/0.12)',
              border: '1px solid rgb(var(--yellow)/0.2)',
            }}
          >
            <Flame size={15} strokeWidth={1.5} style={{ color: 'rgb(var(--yellow))' }} />
            <span className="font-sans text-[14px] font-bold" style={{ color: 'rgb(var(--yellow))' }}>
              {streak}j
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(255 255 255/0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, rgb(var(--green)), rgb(var(--yellow)))',
              boxShadow: '0 0 16px rgb(var(--yellow)/0.4)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-sans text-[10px] font-medium text-white/20">{done}/{total} quêtes</span>
          <span className="font-sans text-[10px] font-semibold" style={{ color: 'rgb(var(--yellow)/0.5)' }}>{pct}%</span>
        </div>
      </div>

      {/* ── Level Card ───────────────────────── */}
      <div
        className="rounded-[20px] p-[18px_16px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgb(var(--yellow)/0.1), rgb(var(--yellow)/0.04))',
          border: '1px solid rgb(var(--yellow)/0.18)',
          boxShadow: '0 2px 12px rgb(var(--yellow)/0.08)',
        }}
      >
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--yellow)/0.15), transparent 70%)' }} />
        <p
          className="font-sans text-[9px] font-bold uppercase tracking-[0.15em]"
          style={{ color: 'rgb(var(--yellow)/0.6)' }}
        >
          Niveau
        </p>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span
            className="font-serif text-4xl font-extrabold leading-none"
            style={{ color: 'rgb(var(--charcoal))', textShadow: '0 0 20px rgb(var(--yellow)/0.2)' }}
          >
            {level}
          </span>
          <span className="font-serif text-[13px] italic" style={{ color: 'rgb(var(--yellow))' }}>{levelName}</span>
        </div>
        <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgb(var(--yellow)/0.1)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${levelProgress}%`,
              background: 'linear-gradient(90deg, rgb(var(--yellow)/0.6), rgb(var(--yellow)))',
              boxShadow: '0 0 8px rgb(var(--yellow)/0.4)',
            }}
          />
        </div>
      </div>

      {/* ── Village Card ─────────────────────── */}
      <div
        className="rounded-[20px] p-[18px_16px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgb(var(--deep-green)/0.15), rgb(var(--green)/0.06))',
          border: '1px solid rgb(var(--green)/0.18)',
          boxShadow: '0 2px 12px rgb(var(--green)/0.08)',
        }}
      >
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--green)/0.2), transparent 70%)' }} />
        <p
          className="font-sans text-[9px] font-bold uppercase tracking-[0.15em]"
          style={{ color: 'rgb(var(--green)/0.7)' }}
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
          <span className="font-serif text-[13px] italic" style={{ color: 'rgb(var(--green))' }}>
            habitants
          </span>
        </div>
        <div className="mt-2 flex">
          {habitantInitials.slice(0, 3).map((initial, i) => (
            <div
              key={i}
              className="w-[26px] h-[26px] rounded-[9px] flex items-center justify-center font-sans text-[10px] font-extrabold"
              style={{
                background: i === 0
                  ? 'rgb(var(--yellow)/0.25)'
                  : i === 1
                    ? 'rgb(var(--purple)/0.25)'
                    : 'rgb(var(--blue)/0.25)',
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
