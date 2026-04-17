'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Users, User } from 'lucide-react'

const tabs = [
  { href: '/maison', label: 'Maison', icon: Home },
  { href: '/fief', label: 'Fief', icon: Compass },
  { href: '/characters', label: 'Personnages', icon: Users },
  { href: '/profil', label: 'Profil', icon: User },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-foreground/25 hover:text-foreground/45'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.5}
                className="transition-all duration-200"
              />
              <span className={`font-sans text-[10px] font-medium tracking-wide transition-all duration-200 ${
                isActive ? 'opacity-100' : 'opacity-60'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
