import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { DiagonalStripe } from '@/components/ui/DiagonalStripe'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { DashboardTasks } from '@/components/dashboard/DashboardTasks'
import { WeeklyCharacterBannerWrapper } from '@/components/characters/WeeklyCharacterBannerWrapper'
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
  let householdHasTasks = false

  if (householdId) {
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase.rpc('get_schedule_for_dates', {
      p_household_id: householdId,
      p_start_date: today,
      p_end_date: today
    })

    todayTasks = data || []

    // Vérifier si le foyer a des tâches assignées (questionnaire complété)
    const { count } = await supabase
      .from('household_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('is_active', true)
      .limit(1)

    householdHasTasks = (count || 0) > 0
  }

  // Le questionnaire est complété si le foyer a des tâches assignées
  const hasCompletedQuestionnaire = householdHasTasks

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-green to-deep-blue relative overflow-hidden">
      <GrainOverlay opacity={0.08} />
      <DiagonalStripe position="top-right" />

      <div className="relative z-10 p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="font-medieval text-xs opacity-50 tracking-wider mb-1 text-cream">
              Bienvenue, noble aventurier
            </div>
            <h1 className="font-cinzel text-4xl md:text-6xl text-cream font-bold leading-none tracking-wide">
              {profile?.display_name || 'Aventurier'}
            </h1>
          </div>

          <div className="bg-gradient-to-br from-yellow to-orange/80 p-4 border border-yellow/20 rounded-lg shadow-golden-lg text-center relative">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red rounded-full animate-glow" />
            <div className="font-cinzel text-4xl font-bold text-black">{profile?.total_points || 0}</div>
            <div className="font-medieval text-xs tracking-wider text-black/70">Pieces d&apos;or</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Serie"
            value={`${profile?.current_streak || 0}J`}
            icon="🔥"
            color="orange"
          />
          <StatCard
            label="Niveau"
            value={profile?.current_level || 1}
            color="yellow"
          />
          <StatCard
            label="Quetes"
            value={profile?.tasks_completed || 0}
            icon="⚔️"
            color="green"
          />
        </div>

        {/* Weekly Character */}
        <WeeklyCharacterBannerWrapper />

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
            <h2 className="font-cinzel text-xl md:text-2xl font-bold text-yellow tracking-wide">
              Mes Foyers
            </h2>
            <div className="flex items-center gap-2">
              <ProgressRing progress={householdProgress} size={28} strokeWidth={3} />
              <span className="font-medieval text-xs opacity-60 text-cream">{totalHouseholds}/5</span>
            </div>
          </div>

          {households && households.length > 0 ? (
            <div className="space-y-3">
              {households.map((membership: any) => (
                <Link key={membership.id} href={`/household/${membership.households?.id}`}>
                  <div className="flex items-stretch border border-charcoal/12 rounded-lg shadow-watercolor hover:shadow-watercolor-lg hover:-translate-y-0.5 transition-all cursor-pointer bg-off-white overflow-hidden">
                    <GrainOverlay opacity={0.03} />
                    <div className="relative z-10 flex-1 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-cinzel text-lg font-semibold text-charcoal">{membership.households?.name}</p>
                        <p className="font-medieval text-xs opacity-60 text-charcoal">
                          {membership.tasks_completed_in_household || 0} quete{(membership.tasks_completed_in_household || 0) > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-cinzel text-2xl font-bold text-yellow">{membership.points_in_household || 0}</p>
                        <p className="font-medieval text-xs opacity-60 text-charcoal">Or</p>
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
                <p className="font-cinzel text-2xl font-bold mb-2">Aucun foyer</p>
                <p className="font-lora text-sm opacity-70 mb-6">
                  Creez ou rejoignez un foyer pour commencer vos quetes
                </p>
                <Link href="/household/setup">
                  <Button>Creer ou rejoindre un foyer</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Next Steps Section - Only show if there are pending steps */}
        {((!households || households.length === 0) || !hasCompletedQuestionnaire) && (
          <Card>
            <CardHeader>
              <CardTitle>Prochaines quetes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(!households || households.length === 0) ? (
                <div className="flex items-center gap-3 font-lora">
                  <span className="text-2xl">🏰</span>
                  <Link href="/household/setup" className="underline font-bold hover:text-yellow transition-colors">
                    Fondez ou rejoignez un foyer
                  </Link>
                </div>
              ) : !hasCompletedQuestionnaire ? (
                <div className="flex items-center gap-3 font-lora">
                  <span className="text-2xl">📜</span>
                  <Link href="/questionnaire" className="underline font-bold hover:text-yellow transition-colors">
                    Completez le questionnaire initial
                  </Link>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
