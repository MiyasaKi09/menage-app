import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function QuestionnairePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire initial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Aidez-nous à personnaliser votre expérience en répondant à quelques questions sur votre foyer, vos équipements et vos préférences.
          </p>

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="text-sm font-medium">🚧 En cours de développement</p>
            <p className="text-sm mt-1">
              Le formulaire du questionnaire sera implémenté dans la prochaine phase. Il comprendra :
            </p>
            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Style de vie (situation, nombre de personnes, enfants, animaux)</li>
              <li>Logement (type, surface, pièces, espace extérieur)</li>
              <li>Équipements (lave-vaisselle, sèche-linge, robot aspirateur, etc.)</li>
              <li>Disponibilité et préférences</li>
            </ul>
          </div>

          <div className="pt-4">
            <Link href="/dashboard">
              <Button>Retour au dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
