import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Connexion</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
