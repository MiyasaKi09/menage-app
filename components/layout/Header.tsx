'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold">
          🏠 Ménage App
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/household">
            <Button variant="ghost">Foyers</Button>
          </Link>
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            Déconnexion
          </Button>
        </nav>
      </div>
    </header>
  )
}
