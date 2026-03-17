import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cream to-off-white">
      <header className="border-b border-charcoal/8">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-cinzel font-bold text-charcoal">Menage App</h1>
          <nav className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button>S&apos;inscrire</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-cinzel font-bold text-charcoal leading-tight">
              Transformez le menage en quete heroique
            </h2>
            <p className="text-xl text-charcoal/60 font-lora">
              Gagnez des pieces d&apos;or, accomplissez des quetes et progressez avec votre foyer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-lg border border-charcoal/8 bg-off-white shadow-watercolor-sm">
              <div className="text-3xl mb-2">📜</div>
              <h3 className="font-cinzel font-semibold mb-2 text-charcoal">Personnalisation</h3>
              <p className="text-sm text-charcoal/60 font-lora">
                Un questionnaire adapte les quetes a votre foyer
              </p>
            </div>
            <div className="p-6 rounded-lg border border-charcoal/8 bg-off-white shadow-watercolor-sm">
              <div className="text-3xl mb-2">⚔️</div>
              <h3 className="font-cinzel font-semibold mb-2 text-charcoal">Gamification</h3>
              <p className="text-sm text-charcoal/60 font-lora">
                Pieces d&apos;or, niveaux, blasons et recompenses
              </p>
            </div>
            <div className="p-6 rounded-lg border border-charcoal/8 bg-off-white shadow-watercolor-sm">
              <div className="text-3xl mb-2">🏰</div>
              <h3 className="font-cinzel font-semibold mb-2 text-charcoal">Mode Guilde</h3>
              <p className="text-sm text-charcoal/60 font-lora">
                Collaborez et partagez les quetes en famille
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Commencer l&apos;aventure</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-charcoal/8 py-8">
        <div className="container mx-auto px-4 text-center text-charcoal/40 font-medieval text-sm">
          &copy; 2025 Menage App. Tous droits reserves.
        </div>
      </footer>
    </div>
  )
}
