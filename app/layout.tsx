import type { Metadata } from 'next'
import { Anton, Space_Mono, Outfit } from 'next/font/google'
import './globals.css'

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const outfit = Outfit({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ménage App - Gamification du ménage',
  description: 'Transformez le ménage en jeu avec votre foyer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${anton.variable} ${spaceMono.variable} ${outfit.variable} font-outfit`}>{children}</body>
    </html>
  )
}
