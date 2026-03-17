import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cream/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-yellow/70 to-yellow/40 rounded-lg flex items-center justify-center">
              <span className="font-cinzel text-[13px] font-bold text-charcoal/60">M</span>
            </div>
            <span className="font-cinzel text-[15px] font-semibold text-charcoal/80">Menage</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative pt-12">
        {/* Radial gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,163,90,0.07), transparent)' }}
        />

        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="font-cinzel text-[clamp(2.5rem,6vw,4.5rem)] font-semibold text-charcoal leading-[1.05] tracking-tight">
            Chaque semaine,
            <br />
            <span className="text-yellow">un heros</span> sommeille
            <br />
            en vous
          </h1>

          <p className="mt-6 text-charcoal/40 font-lora text-lg md:text-xl max-w-md mx-auto leading-relaxed">
            Incarnez des personnages legendaires et transformez
            votre foyer en royaume etincelant.
          </p>

          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg">Commencer l&apos;aventure</Button>
            </Link>
          </div>
        </div>

        {/* Character cards */}
        <div className="max-w-2xl mx-auto px-6 pb-24">
          <div className="flex justify-center items-end gap-3 md:gap-5">
            <CharacterPreview image="/characters/wizard.webp" emoji="🧙" color="#9B8CB5" rotation={-8} size="small" />
            <CharacterPreview image="/characters/noblewoman.webp" emoji="🌹" color="#5A8060" rotation={-3} size="medium" />
            <CharacterPreview image="/characters/angel.webp" emoji="👼" color="#C4A35A" rotation={0} size="large" />
            <CharacterPreview image="/characters/guardian.webp" emoji="🏰" color="#B27060" rotation={3} size="medium" />
            <CharacterPreview image="/characters/oracle.webp" emoji="🔮" color="#556F8B" rotation={8} size="small" />
          </div>
        </div>

        {/* Features */}
        <div className="border-t border-charcoal/[0.04]">
          <div className="max-w-3xl mx-auto px-6 py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-yellow/10 flex items-center justify-center">
                  <span className="text-lg">🃏</span>
                </div>
                <h3 className="font-cinzel text-[15px] font-semibold text-charcoal">Personnages</h3>
                <p className="mt-2 font-lora text-[14px] text-charcoal/35 leading-relaxed">
                  Chaque semaine, un nouveau personnage
                  avec ses pouvoirs uniques.
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-blue/10 flex items-center justify-center">
                  <span className="text-lg">⚔️</span>
                </div>
                <h3 className="font-cinzel text-[15px] font-semibold text-charcoal">Quetes</h3>
                <p className="mt-2 font-lora text-[14px] text-charcoal/35 leading-relaxed">
                  Les taches deviennent des quetes.
                  Gagnez de l&apos;or, montez en niveau.
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-green/10 flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <h3 className="font-cinzel text-[15px] font-semibold text-charcoal">Cite</h3>
                <p className="mt-2 font-lora text-[14px] text-charcoal/35 leading-relaxed">
                  Rejoignez une cite, partagez les quetes.
                  Qui sera le heros de la semaine?
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-charcoal/[0.04] py-6">
        <p className="text-center font-medieval text-[11px] text-charcoal/20">
          &copy; 2025 Menage
        </p>
      </footer>
    </div>
  )
}

function CharacterPreview({
  image,
  emoji,
  color,
  rotation = 0,
  size = 'medium',
}: {
  image?: string
  emoji: string
  color: string
  rotation?: number
  size?: 'small' | 'medium' | 'large'
}) {
  const sizes = {
    small: { w: 'w-20 h-28 md:w-24 md:h-36', text: 'text-2xl md:text-3xl', opacity: 'opacity-50' },
    medium: { w: 'w-24 h-36 md:w-32 md:h-48', text: 'text-3xl md:text-4xl', opacity: 'opacity-70' },
    large: { w: 'w-28 h-44 md:w-36 md:h-56', text: 'text-4xl md:text-5xl', opacity: 'opacity-100' },
  }
  const s = sizes[size]

  return (
    <div
      className={`${s.w} ${s.opacity} rounded-2xl overflow-hidden transition-transform duration-500 hover:scale-105 relative`}
      style={{
        transform: `rotate(${rotation}deg)`,
        border: `1px solid ${color}20`,
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(to bottom, ${color}15, ${color}05)` }}
        >
          <span className={s.text}>{emoji}</span>
        </div>
      )}
    </div>
  )
}
