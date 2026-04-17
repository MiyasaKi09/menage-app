import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'
import { Crown } from 'lucide-react'

export default function SignupPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow/10 border border-yellow/15 mb-4">
          <Crown size={22} className="text-yellow/70" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif font-black text-[1.75rem] text-charcoal tracking-[-0.03em] leading-snug">
          Rejoignez le royaume
        </h1>
        <p className="mt-2 font-sans text-[13px] text-charcoal/35 leading-[1.65]">
          Créez votre compte et commencez l&apos;aventure
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-charcoal/[0.06] p-6 shadow-sm">
        <SignupForm />
      </div>

      <p className="text-center text-[13px] text-charcoal/35 mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-yellow font-semibold hover:text-yellow/75 transition-colors duration-200 cursor-pointer">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
