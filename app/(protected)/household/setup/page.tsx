import { CreateHouseholdForm } from '@/components/household/CreateHouseholdForm'
import { JoinHouseholdForm } from '@/components/household/JoinHouseholdForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function HouseholdSetupPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Fonder ou Rejoindre une Cite</h1>
        <p className="text-muted-foreground">
          Une cite vous permet de partager les quetes avec d&apos;autres aventuriers
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fonder une cite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Fondez une nouvelle cite et invitez d&apos;autres membres a vous rejoindre
            </p>
            <CreateHouseholdForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejoindre une cite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Vous avez recu un code d&apos;invitation ? Rejoignez une cite existante
            </p>
            <JoinHouseholdForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
