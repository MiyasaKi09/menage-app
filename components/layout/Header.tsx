'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { RainbowBar } from '@/components/ui/RainbowBar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  useAuth() // Keep auth check active
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/household', label: 'Foyers' },
    { href: '/tasks', label: 'Quetes' },
    { href: '/characters', label: 'Personnages' },
  ]

  return (
    <>
      <header className="bg-off-white/80 backdrop-blur-md border-b border-charcoal/6 sticky top-0 z-40 transition-colors duration-500">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow/80 to-orange/60 rounded-xl flex items-center justify-center transition-colors duration-500">
              <span className="font-cinzel text-lg font-bold text-charcoal/70">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-cinzel text-lg font-semibold leading-none text-charcoal tracking-wide transition-colors duration-500">Menage</h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-medium tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-yellow/15 text-charcoal'
                        : 'text-charcoal/45 hover:text-charcoal/70 hover:bg-charcoal/4'
                    }`}
                  >
                    {item.label}
                  </button>
                </Link>
              )
            })}

            <div className="w-px h-5 bg-charcoal/8 mx-2" />

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg text-xs font-medieval text-charcoal/35 hover:text-charcoal/60 hover:bg-charcoal/4 transition-all"
            >
              Deconnexion
            </button>
          </nav>
        </div>
      </header>
      <RainbowBar />
    </>
  )
}
