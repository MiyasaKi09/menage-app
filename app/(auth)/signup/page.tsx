import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-[1.75rem] font-bold text-charcoal tracking-tight leading-snug">
          Rejoignez le royaume
        </h1>
        <p className="mt-2 font-sans text-[13px] text-charcoal/35">
          Créez votre compte et commencez l&apos;aventure
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-charcoal/[0.06] p-6 shadow-sm">
        <SignupForm />
      </div>

      <p className="text-center text-[13px] text-charcoal/35 mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-yellow font-semibold hover:text-yellow/80 transition-colors duration-200">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
