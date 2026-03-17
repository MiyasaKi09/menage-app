import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/StatCard'
import { DashboardTasks } from '@/components/dashboard/DashboardTasks'
import { DashboardCharacterHeader } from '@/components/dashboard/DashboardCharacterHeader'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: households } = await supabase
    .from('household_members')
    .select('id, points_in_household, tasks_completed_in_household, households (id, name)')
    .eq('profile_id', user?.id)
    .limit(5)

  const householdId = households?.[0] ? (households[0].households as any)?.id : null

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

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-deep-green to-deep-blue transition-colors duration-700" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10 space-y-10">

        {/* Header with character + user name */}
        <DashboardCharacterHeader
          displayName={profile?.display_name || 'Aventurier'}
          totalPoints={profile?.total_points || 0}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Serie" value={`${profile?.current_streak || 0}j`} icon="🔥" />
          <StatCard label="Niveau" value={profile?.current_level || 1} />
          <StatCard label="Quetes" value={profile?.tasks_completed || 0} icon="⚔️" />
        </div>

        {/* Character banner removed - integrated into header */}

        {/* Tasks */}
        {todayTasks.length > 0 && householdId && user?.id && (
          <DashboardTasks tasks={todayTasks} householdId={householdId} userId={user.id} />
        )}

        {/* Households */}
        {households && households.length > 0 && (
          <div className="space-y-2">
            <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
              Cite
            </p>
            {households.map((m: any) => (
              <Link key={m.id} href={`/household/${m.households?.id}`}>
                <div className="group flex items-center justify-between py-3.5 border-b border-cream/[0.06] last:border-0 transition-colors duration-200">
                  <span className="font-cinzel text-[15px] text-cream/70 group-hover:text-cream transition-colors duration-200">
                    {m.households?.name}
                  </span>
                  <span className="font-cinzel text-[15px] text-yellow/70">{m.points_in_household || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty / onboarding */}
        {(!households || households.length === 0) && (
          <div className="text-center py-16 space-y-4">
            <div className="text-4xl opacity-40">🏰</div>
            <h2 className="font-cinzel text-xl text-cream font-semibold">Fondez votre cite</h2>
            <p className="font-lora text-[14px] text-cream/30 max-w-xs mx-auto">
              Creez ou rejoignez une cite pour demarrer vos quetes
            </p>
            <Link href="/household/setup">
              <Button className="mt-4">Commencer</Button>
            </Link>
          </div>
        )}

        {householdId && !householdHasTasks && (
          <Link href="/questionnaire">
            <div className="group flex items-center gap-4 py-4 border-b border-cream/[0.06] transition-colors duration-200">
              <span className="text-xl opacity-40">📜</span>
              <div>
                <p className="font-cinzel text-[14px] text-cream/60 group-hover:text-cream transition-colors duration-200">
                  Questionnaire initial
                </p>
                <p className="font-lora text-[12px] text-cream/25">
                  Personnalisez vos quetes
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
