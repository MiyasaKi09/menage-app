import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-cream overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-charcoal/6">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow/80 to-orange/60 rounded-xl flex items-center justify-center">
              <span className="font-cinzel text-lg font-bold text-charcoal/80">M</span>
            </div>
            <span className="font-cinzel text-xl font-semibold text-charcoal tracking-wide">Menage</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">S&apos;inscrire</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-64 h-64 bg-yellow/8 rounded-full blur-3xl" />
          <div className="absolute top-40 right-[15%] w-48 h-48 bg-blue/6 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-[30%] w-56 h-56 bg-pink/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow/10 border border-yellow/15">
              <span className="text-sm">🏰</span>
              <span className="font-medieval text-xs text-charcoal/60 tracking-wide">Aventure domestique</span>
            </div>

            {/* Title */}
            <h1 className="font-cinzel text-4xl md:text-6xl font-semibold text-charcoal leading-[1.1] tracking-wide">
              Chaque semaine,
              <br />
              <span className="text-yellow">un heros</span> sommeille
              <br />
              en vous
            </h1>

            <p className="text-lg md:text-xl text-charcoal/50 font-lora max-w-lg mx-auto leading-relaxed">
              Incarnez des personnages legendaires, accomplissez des quetes domestiques
              et transformez votre foyer en royaume etincelant.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Commencer l&apos;aventure
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  J&apos;ai deja un compte
                </Button>
              </Link>
            </div>
          </div>

          {/* Character cards preview */}
          <div className="mt-20 md:mt-28 flex justify-center">
            <div className="flex items-end gap-4 md:gap-6">
              <CharacterPreview emoji="🧙" name="Merlin" color="#9B8CB5" rotation={-6} />
              <CharacterPreview emoji="🌹" name="Dame des Roses" color="#5A8060" rotation={-2} featured />
              <CharacterPreview emoji="🏰" name="Gardien" color="#C4A35A" rotation={3} />
              <CharacterPreview emoji="🔮" name="Oracle" color="#556F8B" rotation={7} className="hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative border-t border-charcoal/6 bg-off-white/50">
          <div className="container mx-auto px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Feature
                icon="🃏"
                title="Personnages"
                description="Chaque semaine, devenez un nouveau personnage avec ses pouvoirs uniques et sa palette de couleurs."
              />
              <Feature
                icon="⚔️"
                title="Quetes"
                description="Les taches menageres deviennent des quetes heroiques. Gagnez de lor et montez en niveau."
              />
              <Feature
                icon="👥"
                title="Guilde"
                description="Formez un foyer, partagez les quetes et decouvrez qui est le heros de la semaine."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal/6 py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="font-medieval text-xs text-charcoal/30 tracking-wide">
            &copy; 2025 Menage App
          </p>
        </div>
      </footer>
    </div>
  )
}

function CharacterPreview({
  emoji,
  name,
  color,
  rotation = 0,
  featured = false,
  className = '',
}: {
  emoji: string
  name: string
  color: string
  rotation?: number
  featured?: boolean
  className?: string
}) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-watercolor-lg transition-transform hover:scale-105 ${featured ? 'w-36 h-52 md:w-44 md:h-64' : 'w-28 h-40 md:w-36 md:h-52 opacity-80'} ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        background: `linear-gradient(to bottom, ${color}22, ${color}08)`,
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex flex-col items-center justify-center h-full gap-2 p-3">
        <span className={featured ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'}>{emoji}</span>
        <span className="font-cinzel text-xs md:text-sm font-medium text-charcoal/60 text-center leading-tight">{name}</span>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: color, opacity: 0.3 }}
      />
    </div>
  )
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center space-y-3">
      <div className="text-3xl">{icon}</div>
      <h3 className="font-cinzel text-lg font-semibold text-charcoal">{title}</h3>
      <p className="font-lora text-sm text-charcoal/50 leading-relaxed">{description}</p>
    </div>
  )
}
