import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/StatCard'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { DashboardTasks } from '@/components/dashboard/DashboardTasks'
import { WeeklyCharacterBannerWrapper } from '@/components/characters/WeeklyCharacterBannerWrapper'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

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

  const householdId = households && households.length > 0
    ? (households[0].households as any)?.id
    : null

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

    const { count } = await supabase
      .from('household_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('is_active', true)
      .limit(1)

    householdHasTasks = (count || 0) > 0
  }

  const hasCompletedQuestionnaire = householdHasTasks

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-page gradient background that changes with character theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-green via-deep-blue to-deep-green/80 transition-colors duration-700" />
      <GrainOverlay opacity={0.04} />

      {/* Subtle decorative orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-[20%] w-72 h-72 bg-yellow/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[10%] w-56 h-56 bg-blue/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="font-medieval text-[11px] opacity-40 tracking-widest mb-2 text-cream uppercase">
              Bienvenue, noble aventurier
            </p>
            <h1 className="font-cinzel text-3xl md:text-5xl text-cream font-semibold leading-none tracking-wide">
              {profile?.display_name || 'Aventurier'}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-cream/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-cream/10">
            <div className="text-right">
              <div className="font-cinzel text-3xl font-semibold text-cream">{profile?.total_points || 0}</div>
              <div className="font-medieval text-[10px] tracking-wider text-cream/50">Pieces d&apos;or</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard label="Serie" value={`${profile?.current_streak || 0}J`} icon="🔥" color="orange" />
          <StatCard label="Niveau" value={profile?.current_level || 1} color="yellow" />
          <StatCard label="Quetes" value={profile?.tasks_completed || 0} icon="⚔️" color="green" />
        </div>

        {/* Weekly Character */}
        <WeeklyCharacterBannerWrapper />

        {/* Today&apos;s Tasks */}
        {todayTasks.length > 0 && householdId && user?.id && (
          <DashboardTasks tasks={todayTasks} householdId={householdId} userId={user.id} />
        )}

        {/* Households */}
        {households && households.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-cinzel text-lg font-semibold text-cream/80 tracking-wide">
              Foyers
            </h2>
            {households.map((membership: any) => (
              <Link key={membership.id} href={`/household/${membership.households?.id}`}>
                <div className="group flex items-center justify-between p-4 rounded-xl bg-cream/8 backdrop-blur-sm border border-cream/8 hover:bg-cream/12 hover:border-cream/15 transition-all cursor-pointer">
                  <div>
                    <p className="font-cinzel text-base font-semibold text-cream group-hover:text-yellow transition-colors">{membership.households?.name}</p>
                    <p className="font-medieval text-[11px] text-cream/40">
                      {membership.tasks_completed_in_household || 0} quetes accomplies
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-cinzel text-xl font-semibold text-yellow">{membership.points_in_household || 0}</p>
                    <p className="font-medieval text-[10px] text-cream/35">or</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state / Next steps */}
        {(!households || households.length === 0) && (
          <div className="text-center py-12 space-y-4">
            <div className="text-5xl">🏰</div>
            <h2 className="font-cinzel text-2xl font-semibold text-cream">Fondez votre foyer</h2>
            <p className="font-lora text-sm text-cream/50 max-w-sm mx-auto">
              Creez ou rejoignez un foyer pour commencer votre aventure
            </p>
            <Link href="/household/setup">
              <Button className="mt-2">Commencer</Button>
            </Link>
          </div>
        )}

        {householdId && !hasCompletedQuestionnaire && (
          <Link href="/questionnaire">
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-yellow/8 border border-yellow/12 hover:bg-yellow/12 hover:border-yellow/20 transition-all cursor-pointer">
              <span className="text-2xl">📜</span>
              <div>
                <p className="font-cinzel text-sm font-semibold text-cream group-hover:text-yellow transition-colors">
                  Questionnaire initial
                </p>
                <p className="font-lora text-xs text-cream/40">
                  Personnalisez les quetes de votre foyer
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
