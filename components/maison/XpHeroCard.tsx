'use client'

import { useState, useEffect, useRef } from 'react'

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

export function XpHeroCard({ dailyXp, totalXp, done, total, streak, level, levelName, levelProgress, habitants, habitantInitials }: XpHeroCardProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {/* XP Hero Card — spans full width */}
      <div
        className="col-span-2 rounded-3xl p-5 relative overflow-hidden shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #1a1714, #2d2520, #1a1714)',
          backgroundSize: '200% 200%',
          animation: 'grad-shift 8s ease infinite',
        }}
      >
        <div className="absolute top-[-20px] right-[-20px] w-[120px] h-[120px] rounded-full" style={{ background: 'radial-gradient(circle, hsla(30,60%,50%,0.15), transparent 70%)' }} />
        <div className="absolute bottom-[-30px] left-[-20px] w-[100px] h-[100px] rounded-full" style={{ background: 'radial-gradient(circle, hsla(150,40%,50%,0.1), transparent 70%)' }} />
        <div className="flex justify-between items-end relative">
          <div>
            <p className="font-sans text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1.5">
              Experience du jour
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-[52px] font-black text-[#F5ECD7] leading-none tracking-tight">
                <AnimNum value={dailyXp} />
              </span>
              <span className="font-serif text-lg text-white/30 italic">xp</span>
            </div>
            <p className="font-sans text-[10px] text-white/20 mt-1">Total : {totalXp} xp</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.08] rounded-[10px] px-3 py-1.5">
            <span className="text-sm">🔥</span>
            <span className="font-sans text-[13px] font-bold text-[hsl(35,50%,75%)]">{streak}j</span>
          </div>
        </div>
        <div className="mt-3.5 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-800"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, hsl(150,40%,50%), hsl(45,55%,60%))',
              boxShadow: '0 0 12px hsla(150,50%,50%,0.3)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-sans text-[10px] font-semibold text-white/20">{done}/{total} quetes</span>
          <span className="font-sans text-[10px] font-semibold text-white/20">{pct}%</span>
        </div>
      </div>

      {/* Level Card */}
      <div className="rounded-[20px] bg-white border border-[#E8E0D4] p-[18px_16px] shadow-sm">
        <p className="font-sans text-[9px] font-bold text-foreground/30 uppercase tracking-[0.12em]">Niveau</p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="font-serif text-4xl font-extrabold text-foreground leading-none">{level}</span>
          <span className="font-serif text-[13px] text-yellow italic">{levelName}</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-[#EDE6DA] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${levelProgress}%`, background: 'linear-gradient(90deg, hsl(24,50%,60%), hsl(24,55%,50%))' }} />
        </div>
      </div>

      {/* Village Card */}
      <div className="rounded-[20px] p-[18px_16px] border" style={{ background: 'linear-gradient(145deg, hsl(150,25%,95%), hsl(150,30%,91%))', borderColor: 'hsl(150,20%,85%)' }}>
        <p className="font-sans text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: 'hsl(150,20%,55%)' }}>Village</p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="font-serif text-4xl font-extrabold leading-none" style={{ color: 'hsl(150,30%,30%)' }}>{habitants}</span>
          <span className="font-serif text-[13px] italic" style={{ color: 'hsl(150,30%,45%)' }}>habitants</span>
        </div>
        <div className="mt-2 flex">
          {habitantInitials.slice(0, 3).map((initial, i) => {
            const hues = [24, 280, 190]
            const hue = hues[i % hues.length]
            return (
              <div
                key={i}
                className="w-[26px] h-[26px] rounded-[9px] flex items-center justify-center font-sans text-[10px] font-extrabold"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue},45%,75%), hsl(${hue},40%,65%))`,
                  border: '2px solid hsl(150,25%,95%)',
                  color: `hsl(${hue},35%,35%)`,
                  marginLeft: i > 0 ? -6 : 0,
                  zIndex: 3 - i,
                }}
              >
                {initial}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
