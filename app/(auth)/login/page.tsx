import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { Sword } from 'lucide-react'

export default function LoginPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow/10 border border-yellow/15 mb-4">
          <Sword size={22} className="text-yellow/70" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif font-black text-[1.75rem] text-charcoal tracking-[-0.03em] leading-snug">
          Bon retour, héros
        </h1>
        <p className="mt-2 font-sans text-[13px] text-charcoal/35 leading-[1.65]">
          Reprenez votre aventure là où vous l&apos;avez laissée
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-charcoal/[0.06] p-6 shadow-sm">
        <LoginForm />
      </div>

      <p className="text-center text-[13px] text-charcoal/35 mt-6">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="text-yellow font-semibold hover:text-yellow/75 transition-colors duration-200 cursor-pointer">
          S&apos;inscrire gratuitement
        </Link>
      </p>
    </div>
  )
}
