import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-[1.75rem] font-bold text-charcoal tracking-tight leading-snug">
          Bon retour, héros
        </h1>
        <p className="mt-2 font-sans text-[13px] text-charcoal/35">
          Reprenez votre aventure là où vous l&apos;avez laissée
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-charcoal/[0.06] p-6 shadow-sm">
        <LoginForm />
      </div>

      <p className="text-center text-[13px] text-charcoal/35 mt-6">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="text-yellow font-semibold hover:text-yellow/80 transition-colors duration-200">
          S&apos;inscrire gratuitement
        </Link>
      </p>
    </div>
  )
}
