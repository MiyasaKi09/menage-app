import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🏠 Ménage App</h1>
          <nav className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button>S'inscrire</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold">
              Transformez le ménage en jeu 🎮
            </h2>
            <p className="text-xl text-muted-foreground">
              Gagnez des points, accomplissez des quêtes et progressez avec votre foyer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-lg border bg-card">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-semibold mb-2">Personnalisation</h3>
              <p className="text-sm text-muted-foreground">
                Un questionnaire adapte les tâches à votre foyer
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-semibold mb-2">Gamification</h3>
              <p className="text-sm text-muted-foreground">
                Points, niveaux, badges et récompenses sociales
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-2">Mode Foyer</h3>
              <p className="text-sm text-muted-foreground">
                Collaborez et partagez les tâches en famille
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © 2025 Ménage App. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
