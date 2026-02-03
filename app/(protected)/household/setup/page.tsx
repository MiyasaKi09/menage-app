import { CreateHouseholdForm } from '@/components/household/CreateHouseholdForm'
import { JoinHouseholdForm } from '@/components/household/JoinHouseholdForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function HouseholdSetupPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Créer ou Rejoindre un Foyer</h1>
        <p className="text-muted-foreground">
          Un foyer vous permet de partager les tâches ménagères avec d'autres personnes
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Créer un foyer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Créez un nouveau foyer et invitez d'autres membres à vous rejoindre
            </p>
            <CreateHouseholdForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejoindre un foyer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Vous avez reçu un code d'invitation ? Rejoignez un foyer existant
            </p>
            <JoinHouseholdForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
