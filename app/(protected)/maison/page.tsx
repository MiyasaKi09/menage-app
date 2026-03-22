import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/StatCard'
import { DashboardCharacterHeader } from '@/components/dashboard/DashboardCharacterHeader'
import { QuickAccessBar } from '@/components/maison/QuickAccessBar'
import { PeripetiesCarousel } from '@/components/maison/PeripetiesCarousel'
import { ConsecrationCarousel } from '@/components/maison/ConsecrationCarousel'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function MaisonPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch all user's households (sans colonne 'status' qui nécessite migration 008)
  const { data: memberships } = await supabase
    .from('household_members')
    .select('id, role, points_in_household, tasks_completed_in_household, households (id, name)')
    .eq('profile_id', user?.id)
    .limit(10)

  const userHouseholds = (memberships || []).map((m: any) => ({
    id: (m.households as any)?.id,
    name: (m.households as any)?.name,
    status: 'active', // default until migration 008 is applied
    role: m.role,
  }))

  // Use first household
  const householdId = userHouseholds[0]?.id || null

  let weekTasks: any[] = []
  let pendingValidation: any[] = []
  let householdHasTasks = false
  let leaderboard: any[] = []

  if (householdId) {
    // Get this week's tasks
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday

    try {
      const { data } = await supabase.rpc('get_schedule_for_dates', {
        p_household_id: householdId,
        p_start_date: startOfWeek.toISOString().split('T')[0],
        p_end_date: endOfWeek.toISOString().split('T')[0],
      })
      weekTasks = data || []
    } catch (error) {
      console.error('Error fetching weekly tasks:', error)
    }

    // Get tasks pending validation (completed by others, not yet validated)
    try {
      const { data: completedByOthers } = await supabase
        .from('scheduled_tasks')
        .select('*, household_tasks(name, points, category_id, categories(name, emoji))')
        .eq('status', 'completed')
        .neq('assigned_to', user?.id)
        .limit(20)
      pendingValidation = completedByOthers || []
    } catch (error) {
      console.error('Error fetching pending validation:', error)
    }

    // Check if household has tasks
    const { count } = await supabase
      .from('household_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('is_active', true)
      .limit(1)
    householdHasTasks = (count || 0) > 0

    // Get leaderboard
    const { data: members } = await supabase
      .from('household_members')
      .select('profile_id, points_in_household, tasks_completed_in_household, profiles(display_name)')
      .eq('household_id', householdId)
      .order('points_in_household', { ascending: false })
      .limit(12)
    leaderboard = members || []
  }

  // Fetch shop items and purchases (tables may not exist yet - migration 009)
  let shopCategoriesData: any[] = []
  let shopItemsData: any[] = []
  let purchasedItemsData: any[] = []

  try {
    const { data: sc } = await supabase.from('shop_categories').select('*').order('display_order')
    shopCategoriesData = sc || []
  } catch { /* migration 009 not applied */ }

  try {
    const { data: si } = await supabase.from('shop_items').select('*, shop_categories(name)').eq('is_available', true).order('price')
    shopItemsData = si || []
  } catch { /* migration 009 not applied */ }

  try {
    const { data: pi } = await supabase.from('purchased_items').select('*, shop_items(name, price, item_type, rarity)').eq('profile_id', user?.id)
    purchasedItemsData = pi || []
  } catch { /* migration 009 not applied */ }

  // Fetch stats: tasks by category from task_history
  let tasksByCategoryArray: Array<{ category: string; emoji: string; count: number }> = []
  try {
    const { data: tasksByCategory } = await supabase
      .from('task_history')
      .select('category_name')
      .eq('profile_id', user?.id)

    const categoryMap: Record<string, number> = {}
    ;(tasksByCategory || []).forEach((t: any) => {
      const cat = t.category_name || 'Autre'
      categoryMap[cat] = (categoryMap[cat] || 0) + 1
    })
    tasksByCategoryArray = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, emoji: '', count }))
      .sort((a, b) => b.count - a.count)
  } catch { /* table may not have data */ }

  // Fetch favorite character (most received)
  let favoriteCharacter: { name: string; class: string; timesReceived: number } | null = null
  try {
    const { data: favoriteChars } = await supabase
      .from('character_collection')
      .select('times_received, avatars(name, character_class)')
      .eq('profile_id', user?.id)
      .order('times_received', { ascending: false })
      .limit(1)

    if (favoriteChars?.[0]) {
      favoriteCharacter = {
        name: (favoriteChars[0].avatars as any)?.name || '',
        class: (favoriteChars[0].avatars as any)?.character_class || '',
        timesReceived: favoriteChars[0].times_received,
      }
    }
  } catch { /* character_collection may not exist */ }

  // Build annual card title
  const topTask = tasksByCategoryArray[0]?.category || null
  const annualCard = favoriteCharacter && topTask
    ? { title: `${favoriteCharacter.name}`, subtitle: `Specialiste ${topTask}` }
    : null

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-deep-green to-deep-blue transition-colors duration-700" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 space-y-8">

        {/* Header with character + user name */}
        <DashboardCharacterHeader
          displayName={profile?.display_name || 'Aventurier'}
          totalPoints={profile?.total_points || 0}
        />

        {/* Quick access buttons */}
        <QuickAccessBar
          totalPoints={profile?.total_points || 0}
          leaderboard={leaderboard}
          households={userHouseholds}
          shopCategories={shopCategoriesData}
          shopItems={shopItemsData}
          purchasedItems={purchasedItemsData}
          stats={{
            streak: profile?.current_streak || 0,
            level: profile?.current_level || 1,
            tasksCompleted: profile?.tasks_completed || 0,
            timesFirst: 0,
            timesSecond: 0,
            timesThird: 0,
            tasksByCategory: tasksByCategoryArray,
            favoriteCharacter,
            annualCard,
          }}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Serie" value={`${profile?.current_streak || 0}j`} icon="🔥" />
          <StatCard label="Niveau" value={profile?.current_level || 1} />
          <StatCard label="Quetes" value={profile?.tasks_completed || 0} icon="⚔️" />
        </div>

        {/* Peripities carousel - tasks of the week */}
        {weekTasks.length > 0 && (
          <PeripetiesCarousel tasks={weekTasks} />
        )}

        {/* Consecration carousel - validate others' tasks */}
        {pendingValidation.length > 0 && user?.id && (
          <ConsecrationCarousel tasks={pendingValidation} userId={user.id} />
        )}

        {/* Empty / onboarding */}
        {(!memberships || memberships.length === 0) && (
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
