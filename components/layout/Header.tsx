'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { RainbowBar } from '@/components/ui/RainbowBar'
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
    <>
      <header className="bg-cream border-b-4 border-black">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-red border-4 border-black transform rotate-45 flex items-center justify-center shadow-brutal-sm">
              <span className="font-anton text-2xl text-white transform -rotate-45">M</span>
            </div>
            <div>
              <h1 className="font-anton text-3xl uppercase leading-none">MÉNAGE</h1>
              <p className="font-space-mono text-[8px] tracking-widest opacity-50">APP v1.0</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/household">
              <Button variant="ghost" size="sm">Foyers</Button>
            </Link>
            <Link href="/tasks">
              <Button variant="ghost" size="sm">Tâches</Button>
            </Link>

            <span className="font-space-mono text-xs opacity-60 ml-2 hidden md:inline">
              {user?.email}
            </span>

            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Déconnexion
            </Button>
          </nav>
        </div>
      </header>
      <RainbowBar />
    </>
  )
}
