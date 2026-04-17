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
        className="col-span-2 rounded-3xl p-5 relative overflow-hidden shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgb(var(--deep-blue)), rgb(var(--deep-green)), rgb(var(--deep-blue)))',
          backgroundSize: '200% 200%',
          animation: 'grad-shift 8s ease infinite',
        }}
      >
        {/* Glow orbs */}
        <div className="absolute top-[-20px] right-[-20px] w-[120px] h-[120px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(var(--character-glow),0.18), transparent 70%)' }} />
        <div className="absolute bottom-[-30px] left-[-20px] w-[100px] h-[100px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(var(--yellow),0.10), transparent 70%)' }} />

        <div className="flex justify-between items-end relative">
          <div>
            <p className="font-sans text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1.5">
              Expérience du jour
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-[52px] font-black leading-none tracking-tight"
                style={{ color: 'rgb(var(--character-glow))' }}>
                <AnimNum value={dailyXp} />
              </span>
              <span className="font-serif text-lg text-white/30 italic">xp</span>
            </div>
            <p className="font-sans text-[10px] text-white/20 mt-1">Total : {totalXp} xp</p>
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.08] rounded-[10px] px-3 py-1.5">
            <Flame size={14} strokeWidth={1.5} style={{ color: 'rgb(var(--yellow))' }} />
            <span className="font-sans text-[13px] font-bold" style={{ color: 'rgb(var(--yellow))' }}>
              {streak}j
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3.5 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, rgb(var(--green)), rgb(var(--yellow)))',
              boxShadow: '0 0 12px rgba(var(--yellow),0.25)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-sans text-[10px] font-semibold text-white/20">{done}/{total} quêtes</span>
          <span className="font-sans text-[10px] font-semibold text-white/20">{pct}%</span>
        </div>
      </div>

      {/* ── Level Card ───────────────────────── */}
      <div className="rounded-[20px] bg-card border border-border p-[18px_16px] shadow-sm">
        <p className="font-sans text-[9px] font-bold text-foreground/30 uppercase tracking-[0.12em]">Niveau</p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="font-serif text-4xl font-extrabold text-foreground leading-none">{level}</span>
          <span className="font-serif text-[13px] text-yellow italic">{levelName}</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${levelProgress}%`,
              background: 'linear-gradient(90deg, rgb(var(--yellow)), rgb(var(--accentSoft, var(--yellow))))',
            }}
          />
        </div>
      </div>

      {/* ── Village Card ─────────────────────── */}
      <div
        className="rounded-[20px] p-[18px_16px] border"
        style={{
          background: 'linear-gradient(145deg, rgb(var(--deep-green)/0.12), rgb(var(--deep-green)/0.06))',
          borderColor: 'rgb(var(--green)/0.15)',
        }}
      >
        <p className="font-sans text-[9px] font-bold uppercase tracking-[0.12em]"
          style={{ color: 'rgb(var(--green)/0.7)' }}>
          Village
        </p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="font-serif text-4xl font-extrabold leading-none"
            style={{ color: 'rgb(var(--charcoal))' }}>
            {habitants}
          </span>
          <span className="font-serif text-[13px] italic"
            style={{ color: 'rgb(var(--green))' }}>
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
