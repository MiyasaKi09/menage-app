import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-5xl mx-auto px-5 h-[52px] flex items-center justify-between bg-background/80 backdrop-blur-2xl rounded-2xl border border-charcoal/[0.06] shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-yellow to-yellow/50 rounded-lg flex items-center justify-center shadow-golden">
                <span className="font-serif font-bold text-[12px] text-charcoal/80">K</span>
              </div>
              <span className="font-serif font-bold text-[15px] text-charcoal/90 tracking-tight">the keep</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-golden">S&apos;inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-24">

        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none select-none" aria-hidden>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(ellipse, rgb(196,163,90), transparent 70%)' }} />
          <div className="absolute top-40 left-[20%] w-[200px] h-[200px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(ellipse, rgb(74,122,115), transparent 70%)' }} />
          <div className="absolute top-32 right-[18%] w-[180px] h-[180px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(ellipse, rgb(155,140,181), transparent 70%)' }} />
        </div>

        {/* Hero content */}
        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-10 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-yellow/25 bg-yellow/[0.06] mb-8">
            <span className="text-xs">✨</span>
            <span className="font-sans text-[12px] font-semibold text-yellow/80 tracking-wide">
              Gamification du ménage
            </span>
          </div>

          <h1 className="font-serif text-[clamp(2.8rem,7vw,5rem)] font-black text-charcoal leading-[1.02] tracking-[-0.03em]">
            Chaque semaine,
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-yellow">un héros</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-yellow/10 rounded-full -z-0" />
            </span>
            <span className="text-charcoal"> sommeille</span>
            <br />
            en vous
          </h1>

          <p className="mt-7 text-charcoal/40 font-sans text-[17px] md:text-lg max-w-[420px] mx-auto leading-relaxed">
            Incarnez des personnages légendaires et transformez
            votre foyer en royaume étincelant.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="shadow-golden-lg px-8">
                Commencer l&apos;aventure
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost" className="text-charcoal/50">
                Déjà un compte →
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <div className="flex -space-x-2">
              {['#B27060','#5A8060','#9B8CB5','#4A7A73','#C4A35A'].map((color, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white" style={{ background: color }}>
                  {['A','M','L','T','S'][i]}
                </div>
              ))}
            </div>
            <p className="font-sans text-[13px] text-charcoal/35">
              <span className="font-semibold text-charcoal/55">+200 foyers</span> déjà engagés
            </p>
          </div>
        </div>

        {/* Character cards */}
        <div className="relative max-w-2xl mx-auto px-6 pb-20">
          <div className="flex justify-center items-end gap-3 md:gap-5">
            <CharacterPreview image="/characters/mage.png" emoji="🧙" color="#9B8CB5" rotation={-9} size="small" delay={0} />
            <CharacterPreview image="/characters/imperatrice.png" emoji="👑" color="#5A8060" rotation={-4} size="medium" delay={80} />
            <CharacterPreview image="/characters/ange.png" emoji="👼" color="#C4A35A" rotation={0} size="large" delay={0} glow />
            <CharacterPreview image="/characters/sentinelle.png" emoji="🏰" color="#B27060" rotation={4} size="medium" delay={80} />
            <CharacterPreview image="/characters/devin.png" emoji="🔮" color="#556F8B" rotation={9} size="small" delay={0} />
          </div>

          {/* Ground reflection */}
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-charcoal/[0.06] to-transparent" />
        </div>

        {/* Stats bar */}
        <div className="border-y border-charcoal/[0.04] bg-charcoal/[0.015]">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '12 min', label: 'par jour en moyenne' },
                { value: '94%', label: 'de tâches complétées' },
                { value: '5 rôles', label: 'de personnages uniques' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-serif text-[1.6rem] font-bold text-charcoal/80 leading-none">{stat.value}</p>
                  <p className="mt-1.5 font-sans text-[12px] text-charcoal/30 leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="font-sans text-[11px] font-semibold text-charcoal/30 uppercase tracking-[0.18em] mb-3">Comment ça marche</p>
            <h2 className="font-serif text-[2rem] md:text-[2.5rem] font-bold text-charcoal tracking-tight leading-snug">
              Trois étapes vers<br />la gloire ménagère
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🏰',
                color: 'yellow',
                title: 'Fondez votre cité',
                desc: 'Créez votre foyer, invitez vos cohabitants. Chacun rejoint le royaume.',
              },
              {
                step: '02',
                icon: '🎭',
                color: 'purple',
                title: 'Choisissez un rôle',
                desc: 'Chaque semaine, incarnez un nouveau héros avec ses pouvoirs uniques.',
              },
              {
                step: '03',
                icon: '⚔️',
                color: 'green',
                title: 'Partez en quête',
                desc: 'Les corvées deviennent des aventures. Gagnez de l\'or, montez en niveau.',
              },
            ].map((item) => (
              <StepCard key={item.step} {...item} />
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-charcoal/[0.02] border-y border-charcoal/[0.04]">
          <div className="max-w-3xl mx-auto px-6 py-24">
            <div className="text-center mb-14">
              <p className="font-sans text-[11px] font-semibold text-charcoal/30 uppercase tracking-[0.18em] mb-3">Les pouvoirs du Keep</p>
              <h2 className="font-serif text-[2rem] md:text-[2.5rem] font-bold text-charcoal tracking-tight leading-snug">
                Tout ce dont votre<br />royaume a besoin
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  emoji: '🃏',
                  bg: 'bg-yellow/[0.07]',
                  border: 'border-yellow/10',
                  title: 'Personnages',
                  desc: 'Chaque semaine, un nouveau personnage avec ses pouvoirs et bonus uniques.',
                },
                {
                  emoji: '⚔️',
                  bg: 'bg-blue/[0.07]',
                  border: 'border-blue/10',
                  title: 'Quêtes',
                  desc: 'Les tâches deviennent des quêtes épiques. Gagnez de l\'or, montez en niveau.',
                },
                {
                  emoji: '👥',
                  bg: 'bg-green/[0.07]',
                  border: 'border-green/10',
                  title: 'Cité',
                  desc: 'Rejoignez une cité, partagez les quêtes. Qui sera le héros de la semaine ?',
                },
                {
                  emoji: '📅',
                  bg: 'bg-purple/[0.07]',
                  border: 'border-purple/10',
                  title: 'Planning IA',
                  desc: 'Un planning automatique et intelligent adapté à votre foyer.',
                },
                {
                  emoji: '🏆',
                  bg: 'bg-orange/[0.07]',
                  border: 'border-orange/10',
                  title: 'Classement',
                  desc: 'Compétition amicale entre habitants. Qui règnera sur le royaume ?',
                },
                {
                  emoji: '🎁',
                  bg: 'bg-pink/[0.07]',
                  border: 'border-pink/10',
                  title: 'Boutique',
                  desc: 'Dépensez votre or pour des récompenses et décorations exclusives.',
                },
              ].map((feat) => (
                <FeatureCard key={feat.title} {...feat} />
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="relative overflow-hidden rounded-3xl border border-yellow/20 bg-gradient-to-br from-yellow/[0.06] via-yellow/[0.03] to-transparent p-10 text-center">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, rgb(196,163,90), transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, rgb(196,163,90), transparent 70%)', transform: 'translate(-30%, 30%)' }} />

            <div className="relative z-10">
              <span className="text-4xl">🏰</span>
              <h2 className="mt-5 font-serif text-[2rem] md:text-[2.5rem] font-bold text-charcoal tracking-tight leading-snug">
                Prêt à réveiller<br />le héros en vous ?
              </h2>
              <p className="mt-4 font-sans text-[15px] text-charcoal/40 max-w-sm mx-auto leading-relaxed">
                Rejoignez des centaines de foyers qui ont transformé leurs corvées en aventures épiques.
              </p>
              <div className="mt-8">
                <Link href="/signup">
                  <Button size="lg" className="shadow-golden-lg px-10">
                    Commencer gratuitement
                  </Button>
                </Link>
              </div>
              <p className="mt-4 font-sans text-[12px] text-charcoal/25">Gratuit • Pas de carte bancaire requise</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal/[0.04]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow/70 to-yellow/40 rounded-md flex items-center justify-center">
              <span className="font-serif font-bold text-[10px] text-charcoal/70">K</span>
            </div>
            <span className="font-serif font-semibold text-[13px] text-charcoal/50">the keep</span>
          </div>
          <p className="font-sans text-[11px] text-charcoal/25">
            &copy; 2025 The Keep — Tous droits réservés
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-sans text-[12px] text-charcoal/30 hover:text-charcoal/60 transition-colors">Connexion</Link>
            <Link href="/signup" className="font-sans text-[12px] text-charcoal/30 hover:text-charcoal/60 transition-colors">S&apos;inscrire</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────── */

function CharacterPreview({
  image,
  emoji,
  color,
  rotation = 0,
  size = 'medium',
  delay = 0,
  glow = false,
}: {
  image?: string
  emoji: string
  color: string
  rotation?: number
  size?: 'small' | 'medium' | 'large'
  delay?: number
  glow?: boolean
}) {
  const sizes = {
    small:  { w: 'w-[72px] h-[104px] md:w-[88px] md:h-[132px]', text: 'text-2xl md:text-3xl', opacity: 'opacity-45' },
    medium: { w: 'w-[88px] h-[132px] md:w-[112px] md:h-[168px]', text: 'text-3xl md:text-4xl', opacity: 'opacity-65' },
    large:  { w: 'w-[104px] h-[160px] md:w-[136px] md:h-[208px]', text: 'text-4xl md:text-5xl', opacity: 'opacity-100' },
  }
  const s = sizes[size]

  return (
    <div
      className={`${s.w} ${s.opacity} rounded-2xl overflow-hidden relative group`}
      style={{
        transform: `rotate(${rotation}deg)`,
        border: `1px solid ${color}28`,
        boxShadow: glow ? `0 8px 32px ${color}22, 0 2px 8px ${color}15` : `0 2px 8px rgba(26,23,20,0.06)`,
        animation: `float ${3 + delay / 1000}s ease-in-out infinite`,
        animationDelay: `${delay}ms`,
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(to bottom, ${color}18, ${color}06)` }}
        >
          <span className={s.text}>{emoji}</span>
        </div>
      )}
      {/* Subtle hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(to top, ${color}18, transparent 60%)` }} />
    </div>
  )
}

function StepCard({
  step, icon, color, title, desc,
}: {
  step: string
  icon: string
  color: string
  title: string
  desc: string
}) {
  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow/[0.07] border-yellow/[0.12]',
    purple: 'bg-purple/[0.07] border-purple/[0.12]',
    green:  'bg-green/[0.07] border-green/[0.12]',
  }
  const numberMap: Record<string, string> = {
    yellow: 'text-yellow/60',
    purple: 'text-purple/60',
    green:  'text-green/60',
  }

  return (
    <div className="group relative">
      <div className={`rounded-2xl border p-6 ${colorMap[color]} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}>
        <div className="flex items-start justify-between mb-4">
          <span className="text-2xl">{icon}</span>
          <span className={`font-serif font-black text-[2rem] leading-none ${numberMap[color]} opacity-60`}>{step}</span>
        </div>
        <h3 className="font-sans font-bold text-[15px] text-charcoal mb-2">{title}</h3>
        <p className="font-sans text-[13px] text-charcoal/40 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function FeatureCard({
  emoji, bg, border, title, desc,
}: {
  emoji: string
  bg: string
  border: string
  title: string
  desc: string
}) {
  return (
    <div className={`rounded-2xl border p-5 ${bg} ${border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
      <div className="w-9 h-9 mb-4 rounded-xl bg-white/60 flex items-center justify-center text-lg shadow-sm">
        {emoji}
      </div>
      <h3 className="font-sans font-semibold text-[14px] text-charcoal mb-1.5">{title}</h3>
      <p className="font-sans text-[13px] text-charcoal/38 leading-relaxed">{desc}</p>
    </div>
  )
}
