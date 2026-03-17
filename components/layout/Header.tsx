'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  useAuth()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/household', label: 'Cite' },
    { href: '/tasks', label: 'Quetes' },
    { href: '/characters', label: 'Personnages' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-off-white/70 backdrop-blur-xl border-b border-charcoal/[0.04] transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-gradient-to-br from-yellow/70 to-yellow/40 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <span className="font-cinzel text-[13px] font-bold text-charcoal/60">M</span>
          </div>
          <span className="font-cinzel text-[15px] font-semibold text-charcoal/80 hidden sm:inline">Menage</span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}>
                <span className={`px-3 py-1.5 rounded-lg text-[13px] font-cinzel transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-charcoal bg-charcoal/[0.06]'
                    : 'text-charcoal/35 hover:text-charcoal/60'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          <div className="w-px h-4 bg-charcoal/[0.06] mx-2" />

          <button
            onClick={handleSignOut}
            className="text-[12px] font-medieval text-charcoal/20 hover:text-charcoal/45 transition-colors duration-200 px-2"
          >
            Quitter
          </button>
        </nav>
      </div>
    </header>
  )
}
