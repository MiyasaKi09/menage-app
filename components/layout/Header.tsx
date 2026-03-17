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
      <header className="bg-off-white border-b border-charcoal/10 shadow-watercolor-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow to-orange rounded-lg border border-charcoal/12 flex items-center justify-center shadow-golden">
              <span className="font-cinzel text-2xl font-bold text-black">M</span>
            </div>
            <div>
              <h1 className="font-cinzel text-2xl font-bold leading-none text-charcoal tracking-wide">Menage</h1>
              <p className="font-medieval text-[10px] tracking-widest opacity-50 text-charcoal">Quetes du Foyer</p>
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
              <Button variant="ghost" size="sm">Quetes</Button>
            </Link>
            <Link href="/characters">
              <Button variant="ghost" size="sm">Personnages</Button>
            </Link>

            <span className="font-medieval text-xs opacity-60 ml-2 hidden md:inline text-charcoal">
              {user?.email}
            </span>

            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Deconnexion
            </Button>
          </nav>
        </div>
      </header>
      <RainbowBar />
    </>
  )
}
