import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Créer un compte</CardTitle>
      </CardHeader>
      <CardContent>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
