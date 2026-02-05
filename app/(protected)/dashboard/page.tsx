import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { DiagonalStripe } from '@/components/ui/DiagonalStripe'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { RainbowBar } from '@/components/ui/RainbowBar'
import { DashboardTasks } from '@/components/dashboard/DashboardTasks'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Récupérer les données du profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Récupérer les foyers de l'utilisateur
  const { data: households } = await supabase
    .from('household_members')
    .select(`
      id,
      points_in_household,
      tasks_completed_in_household,
      households (
        id,
        name
      )
    `)
    .eq('profile_id', user?.id)
    .limit(5)

  const totalHouseholds = households?.length || 0
  const householdProgress = (totalHouseholds / 5) * 100 // Progress toward 5 households

  // Extraire le household_id du premier foyer
  const householdId = households && households.length > 0
    ? (households[0].households as any)?.id
    : null

  // Récupérer les tâches du jour
  let todayTasks: any[] = []
  if (householdId) {
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase.rpc('get_schedule_for_dates', {
      p_household_id: householdId,
      p_start_date: today,
      p_end_date: today
    })

    todayTasks = data || []
  }

  // Vérifier si le questionnaire a été complété
  // Si l'utilisateur a des tâches planifiées, c'est que le questionnaire a été fait
  const hasCompletedQuestionnaire = todayTasks.length > 0 || (profile?.tasks_completed && profile.tasks_completed > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-blue to-[#0f1a40] relative overflow-hidden">
      <GrainOverlay />
      <DiagonalStripe position="top-right" />

      <div className="relative z-10 p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="font-space-mono text-xs opacity-50 uppercase tracking-wider mb-1 text-cream">
              BIENVENUE
            </div>
            <h1 className="font-anton text-4xl md:text-6xl text-cream uppercase leading-none">
              {profile?.display_name || 'UTILISATEUR'}
            </h1>
          </div>

          <div className="bg-yellow p-4 border-4 border-black shadow-brutal text-center relative">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red rounded-full animate-pulse" />
            <div className="font-anton text-4xl uppercase">{profile?.total_points || 0}</div>
            <div className="font-space-mono text-xs tracking-wider">POINTS</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="STREAK"
            value={`${profile?.current_streak || 0}J`}
            icon="🔥"
            color="orange"
          />
          <StatCard
            label="NIVEAU"
            value={profile?.current_level || 1}
            color="yellow"
          />
          <StatCard
            label="TÂCHES"
            value={profile?.tasks_completed || 0}
            icon="✅"
            color="green"
          />
        </div>

        {/* Today's Tasks Section */}
        {todayTasks.length > 0 && householdId && user?.id && (
          <DashboardTasks
            tasks={todayTasks}
            householdId={householdId}
            userId={user.id}
          />
        )}

        {/* Households Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-anton text-xl md:text-2xl uppercase text-yellow tracking-wide">
              MES FOYERS
            </h2>
            <div className="flex items-center gap-2">
              <ProgressRing progress={householdProgress} size={28} strokeWidth={3} />
              <span className="font-space-mono text-xs opacity-60 text-cream">{totalHouseholds}/5</span>
            </div>
          </div>

          {households && households.length > 0 ? (
            <div className="space-y-3">
              {households.map((membership: any) => (
                <Link key={membership.id} href={`/household/${membership.households?.id}`}>
                  <div className="flex items-stretch border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer bg-off-white overflow-hidden">
                    <GrainOverlay opacity={0.02} />
                    <div className="relative z-10 flex-1 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-anton text-lg uppercase">{membership.households?.name}</p>
                        <p className="font-space-mono text-xs opacity-60">
                          {membership.tasks_completed_in_household || 0} tâche{(membership.tasks_completed_in_household || 0) > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-anton text-2xl">{membership.points_in_household || 0}</p>
                        <p className="font-space-mono text-xs opacity-60">PTS</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              <Link href="/household">
                <Button variant="outline" size="sm" className="w-full">
                  Voir tous les foyers
                </Button>
              </Link>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="font-anton text-2xl uppercase mb-2">Aucun foyer</p>
                <p className="font-outfit text-sm opacity-70 mb-6">
                  Créez ou rejoignez un foyer pour commencer à partager les tâches
                </p>
                <Link href="/household/setup">
                  <Button>Créer ou rejoindre un foyer</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Next Steps Section - Only show if there are pending steps */}
        {((!households || households.length === 0) || !hasCompletedQuestionnaire) && (
          <Card>
            <CardHeader>
              <CardTitle>Prochaines étapes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(!households || households.length === 0) ? (
                <div className="flex items-center gap-3 font-outfit">
                  <span className="text-2xl">🏠</span>
                  <Link href="/household/setup" className="underline font-bold hover:text-yellow transition-colors">
                    Créez ou rejoignez un foyer
                  </Link>
                </div>
              ) : !hasCompletedQuestionnaire ? (
                <div className="flex items-center gap-3 font-outfit">
                  <span className="text-2xl">📝</span>
                  <Link href="/questionnaire" className="underline font-bold hover:text-yellow transition-colors">
                    Complétez le questionnaire initial
                  </Link>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Rainbow Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <RainbowBar />
      </div>
    </div>
  )
}
