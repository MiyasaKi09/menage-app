import type { Metadata } from 'next'
import { Cinzel, MedievalSharp, Lora } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const medievalSharp = MedievalSharp({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-medieval',
  display: 'swap',
})

const lora = Lora({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-lora',
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
      <body className={`${cinzel.variable} ${medievalSharp.variable} ${lora.variable} font-lora`}>{children}</body>
    </html>
  )
}
