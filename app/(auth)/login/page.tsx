import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-charcoal text-center mb-8">
        Connexion
      </h1>
      <LoginForm />
      <p className="text-center text-[13px] text-charcoal/35 mt-8">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="text-charcoal/60 hover:text-charcoal transition-colors duration-200">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  )
}
