import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  Sword,
  Crown,
  Users,
  Trophy,
  CalendarDays,
  Gift,
  Flame,
  Sparkles,
  ChevronRight,
  Star,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── NAV ──────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <nav className="max-w-5xl mx-auto px-5 h-[54px] flex items-center justify-between bg-background/85 backdrop-blur-2xl rounded-2xl border border-charcoal/[0.07] shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow to-yellow/50 rounded-xl flex items-center justify-center shadow-golden">
                <span className="font-serif font-black text-[13px] text-charcoal/80">K</span>
              </div>
              <span className="font-serif font-black text-[16px] text-charcoal/90 tracking-tight">the keep</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="cursor-pointer">Connexion</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-golden cursor-pointer">S&apos;inscrire</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>

        {/* ── HERO ─────────────────────────────────── */}
        <section className="relative pt-28 pb-0 overflow-hidden bg-[rgb(var(--charcoal))]">

          {/* Animated background pattern */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(196,163,90) 1px, transparent 0)', backgroundSize: '36px 36px' }} />
            <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] rounded-full opacity-[0.08]"
              style={{ background: 'radial-gradient(circle, rgb(196,163,90), transparent 70%)', filter: 'blur(60px)' }} />
            <div className="absolute top-1/3 right-1/4 w-[320px] h-[320px] rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, rgb(155,140,181), transparent 70%)', filter: 'blur(50px)' }} />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow/20 bg-yellow/[0.08] mb-8 cursor-default">
              <Sparkles size={13} className="text-yellow/70" strokeWidth={2} />
              <span className="font-sans text-[12px] font-semibold text-yellow/70 tracking-widest uppercase">
                Gamification du ménage
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif font-black text-[clamp(3rem,8vw,5.5rem)] leading-[1.0] tracking-[-0.03em] text-white">
              Chaque semaine,
              <br />
              <span className="bg-gradient-to-r from-yellow via-yellow/90 to-yellow/60 bg-clip-text text-transparent">
                un héros
              </span>
              {' '}sommeille
              <br />
              en vous
            </h1>

            <p className="mt-7 font-sans text-[18px] text-white/40 max-w-[460px] mx-auto leading-[1.65]">
              Incarnez des personnages légendaires et transformez votre foyer en royaume étincelant.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="shadow-golden-lg px-8 cursor-pointer">
                  Commencer l&apos;aventure
                  <ChevronRight size={16} strokeWidth={2.5} />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="text-white/40 hover:text-white cursor-pointer">
                  Déjà un compte
                  <ChevronRight size={14} />
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {['#B27060','#5A8060','#9B8CB5','#4A7A73','#C4A35A'].map((color, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[rgb(var(--charcoal))] flex items-center justify-center text-[11px] font-bold text-white" style={{ background: color }}>
                    {['A','M','L','T','S'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={11} className="text-yellow fill-yellow" />)}
              </div>
              <p className="font-sans text-[13px] text-white/30">
                <span className="text-white/55 font-semibold">+200 foyers</span> engagés
              </p>
            </div>

            {/* Characters strip */}
            <div className="mt-16 flex justify-center items-end gap-3 md:gap-5">
              <CharCard image="/characters/mage.png" color="#9B8CB5" rotation={-9} size="sm" />
              <CharCard image="/characters/imperatrice.png" color="#5A8060" rotation={-4} size="md" />
              <CharCard image="/characters/ange.png" color="#C4A35A" rotation={0} size="lg" glow />
              <CharCard image="/characters/sentinelle.png" color="#B27060" rotation={4} size="md" />
              <CharCard image="/characters/devin.png" color="#556F8B" rotation={9} size="sm" />
            </div>
          </div>

          {/* Bottom fade to background */}
          <div className="h-24 bg-gradient-to-b from-transparent to-background" />
        </section>

        {/* ── STATS ────────────────────────────────── */}
        <section className="border-y border-charcoal/[0.05]">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="grid grid-cols-3 gap-6 md:gap-10">
              {[
                { value: '12 min', label: 'par jour en moyenne' },
                { value: '94%',    label: 'de tâches complétées' },
                { value: '5 rôles', label: 'de personnages uniques' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="font-serif text-[2rem] md:text-[2.5rem] font-black text-charcoal leading-none">{stat.value}</p>
                  <p className="mt-2 font-sans text-[13px] text-charcoal/35 leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────── */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="font-sans text-[11px] font-bold text-charcoal/30 uppercase tracking-[0.2em] mb-4">Comment ça marche</p>
              <h2 className="font-serif font-black text-[clamp(2rem,5vw,3.2rem)] text-charcoal tracking-[-0.03em] leading-[1.1]">
                Trois étapes vers<br />la gloire ménagère
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StepCard
                step="01"
                icon={<Crown size={22} strokeWidth={1.5} />}
                colorClass="bg-yellow/[0.08] border-yellow/15 text-yellow/80"
                numClass="text-yellow/20"
                title="Fondez votre cité"
                desc="Créez votre foyer, invitez vos cohabitants. Chacun rejoint le royaume."
              />
              <StepCard
                step="02"
                icon={<Sparkles size={22} strokeWidth={1.5} />}
                colorClass="bg-purple/[0.08] border-purple/15 text-purple/80"
                numClass="text-purple/20"
                title="Choisissez un rôle"
                desc="Chaque semaine, incarnez un nouveau héros avec ses pouvoirs uniques."
              />
              <StepCard
                step="03"
                icon={<Sword size={22} strokeWidth={1.5} />}
                colorClass="bg-green/[0.08] border-green/15 text-green/80"
                numClass="text-green/20"
                title="Partez en quête"
                desc="Les corvées deviennent des aventures épiques. Gagnez de l'or, montez en niveau."
              />
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────── */}
        <section className="py-28 px-6 bg-charcoal/[0.02] border-y border-charcoal/[0.04]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="font-sans text-[11px] font-bold text-charcoal/30 uppercase tracking-[0.2em] mb-4">Les pouvoirs du Keep</p>
              <h2 className="font-serif font-black text-[clamp(2rem,5vw,3.2rem)] text-charcoal tracking-[-0.03em] leading-[1.1]">
                Tout ce dont votre<br />royaume a besoin
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FeatureCard
                icon={<Crown size={20} strokeWidth={1.5} />}
                iconBg="bg-yellow/10 text-yellow/80"
                border="border-yellow/10"
                title="Personnages"
                desc="Chaque semaine, un nouveau personnage avec ses pouvoirs et bonus uniques."
              />
              <FeatureCard
                icon={<Sword size={20} strokeWidth={1.5} />}
                iconBg="bg-blue/10 text-blue/80"
                border="border-blue/10"
                title="Quêtes"
                desc="Les tâches deviennent des quêtes épiques. Gagnez de l'or et montez en niveau."
              />
              <FeatureCard
                icon={<Users size={20} strokeWidth={1.5} />}
                iconBg="bg-green/10 text-green/80"
                border="border-green/10"
                title="Cité"
                desc="Rejoignez une cité, partagez les quêtes. Qui sera le héros de la semaine ?"
              />
              <FeatureCard
                icon={<CalendarDays size={20} strokeWidth={1.5} />}
                iconBg="bg-purple/10 text-purple/80"
                border="border-purple/10"
                title="Planning IA"
                desc="Un planning automatique et intelligent adapté à votre rythme de vie."
              />
              <FeatureCard
                icon={<Trophy size={20} strokeWidth={1.5} />}
                iconBg="bg-orange/10 text-orange/80"
                border="border-orange/10"
                title="Classement"
                desc="Compétition amicale entre habitants. Qui régnera sur le royaume ?"
              />
              <FeatureCard
                icon={<Gift size={20} strokeWidth={1.5} />}
                iconBg="bg-pink/10 text-pink/80"
                border="border-pink/10"
                title="Boutique"
                desc="Dépensez votre or pour des récompenses et décorations exclusives."
              />
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-[rgb(var(--charcoal))] p-12 md:p-16 text-center">

              {/* Pattern */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(196,163,90) 1px, transparent 0)', backgroundSize: '36px 36px' }} />
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.10]"
                  style={{ background: 'radial-gradient(circle, rgb(196,163,90), transparent 70%)' }} />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-[0.08]"
                  style={{ background: 'radial-gradient(circle, rgb(155,140,181), transparent 70%)' }} />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow/10 border border-yellow/20 mb-6">
                  <Flame size={26} className="text-yellow/80" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif font-black text-[clamp(2rem,5vw,3rem)] text-white tracking-[-0.03em] leading-[1.1]">
                  Prêt à réveiller<br />le héros en vous ?
                </h2>
                <p className="mt-5 font-sans text-[16px] text-white/35 max-w-sm mx-auto leading-[1.65]">
                  Rejoignez des centaines de foyers qui ont transformé leurs corvées en aventures épiques.
                </p>
                <div className="mt-8">
                  <Link href="/signup">
                    <Button size="lg" className="shadow-golden-lg px-10 cursor-pointer">
                      Commencer gratuitement
                      <ChevronRight size={16} strokeWidth={2.5} />
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 font-sans text-[12px] text-white/20">Gratuit · Pas de carte bancaire requise</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="border-t border-charcoal/[0.05]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow/80 to-yellow/40 rounded-lg flex items-center justify-center">
              <span className="font-serif font-black text-[10px] text-charcoal/70">K</span>
            </div>
            <span className="font-serif font-semibold text-[13px] text-charcoal/50">the keep</span>
          </div>
          <p className="font-sans text-[11px] text-charcoal/25">&copy; 2025 The Keep — Tous droits réservés</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="font-sans text-[12px] text-charcoal/30 hover:text-charcoal/70 transition-colors duration-200 cursor-pointer">Connexion</Link>
            <Link href="/signup" className="font-sans text-[12px] text-charcoal/30 hover:text-charcoal/70 transition-colors duration-200 cursor-pointer">S&apos;inscrire</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────── */

function CharCard({
  image,
  color,
  rotation = 0,
  size = 'md',
  glow = false,
}: {
  image?: string
  color: string
  rotation?: number
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}) {
  const s = {
    sm: 'w-[70px] h-[105px] md:w-[86px] md:h-[130px] opacity-40',
    md: 'w-[86px] h-[130px] md:w-[110px] md:h-[165px] opacity-65',
    lg: 'w-[102px] h-[158px] md:w-[134px] md:h-[206px] opacity-100',
  }[size]

  return (
    <div
      className={`${s} rounded-2xl overflow-hidden relative group cursor-default`}
      style={{
        transform: `rotate(${rotation}deg)`,
        border: `1px solid ${color}25`,
        boxShadow: glow
          ? `0 12px 40px ${color}30, 0 4px 12px ${color}20`
          : `0 4px 12px rgba(26,23,20,0.15)`,
        animation: `float ${3.2 + Math.abs(rotation) * 0.1}s ease-in-out infinite`,
        animationDelay: `${Math.abs(rotation) * 80}ms`,
      }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(to top, ${color}25, transparent 55%)` }}
      />
    </div>
  )
}

function StepCard({
  step, icon, colorClass, numClass, title, desc,
}: {
  step: string
  icon: React.ReactNode
  colorClass: string
  numClass: string
  title: string
  desc: string
}) {
  return (
    <div className={`rounded-2xl border p-7 ${colorClass} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default`}>
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/40">
          {icon}
        </div>
        <span className={`font-serif font-black text-[3rem] leading-none ${numClass}`}>{step}</span>
      </div>
      <h3 className="font-sans font-bold text-[15px] text-charcoal mb-2">{title}</h3>
      <p className="font-sans text-[13px] text-charcoal/40 leading-[1.65]">{desc}</p>
    </div>
  )
}

function FeatureCard({
  icon, iconBg, border, title, desc,
}: {
  icon: React.ReactNode
  iconBg: string
  border: string
  title: string
  desc: string
}) {
  return (
    <div className={`rounded-2xl border ${border} bg-white/50 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        {icon}
      </div>
      <h3 className="font-sans font-bold text-[14px] text-charcoal mb-1.5">{title}</h3>
      <p className="font-sans text-[13px] text-charcoal/38 leading-[1.65]">{desc}</p>
    </div>
  )
}
