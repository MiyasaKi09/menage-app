import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div>
      <h1 className="font-cinzel text-2xl font-semibold text-charcoal text-center mb-8">
        Creer un compte
      </h1>
      <SignupForm />
      <p className="text-center text-[13px] text-charcoal/35 mt-8">
        Deja un compte ?{' '}
        <Link href="/login" className="text-charcoal/60 hover:text-charcoal transition-colors duration-200">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
