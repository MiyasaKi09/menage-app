import { createClient } from '@/lib/supabase/server'
import { QuickAccessBar } from '@/components/maison/QuickAccessBar'
import { ConsecrationCarousel } from '@/components/maison/ConsecrationCarousel'
import { MaisonQuestsSection } from '@/components/maison/MaisonQuestsSection'
import { XpHeroCard } from '@/components/maison/XpHeroCard'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

// Corvées are a separate table (migration 012), péripéties = all scheduled_tasks

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
  let corveeData: any[] = []

  if (householdId) {
    // Get this week's tasks
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday
    const startStr = startOfWeek.toISOString().split('T')[0]
    const endStr = endOfWeek.toISOString().split('T')[0]

    // Handle late tasks from yesterday
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    try {
      await supabase.rpc('handle_late_tasks', {
        p_household_id: householdId,
        p_current_date: yesterday.toISOString().split('T')[0],
      })
    } catch (error) {
      console.error('Error handling late tasks:', error)
    }

    // Generate schedule for each day of the week (same pattern as schedule page)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      if (dateStr < todayStr) continue // skip past days

      try {
        const { error: smartError } = await supabase.rpc('generate_smart_schedule', {
          p_household_id: householdId,
          p_target_date: dateStr,
        })
        if (smartError) {
          await supabase.rpc('generate_daily_schedule', {
            p_household_id: householdId,
            p_target_date: dateStr,
          })
        }
      } catch (error) {
        console.error(`Error generating schedule for ${dateStr}:`, error)
      }
    }

    // Fetch schedule for the week
    try {
      const { data } = await supabase.rpc('get_schedule_for_dates', {
        p_household_id: householdId,
        p_start_date: startStr,
        p_end_date: endStr,
      })
      weekTasks = data || []
    } catch (error) {
      console.error('Error fetching weekly tasks:', error)
    }

    // Fetch corvées (separate from péripéties) — migration 012
    try {
      const weekStart = startStr
      const { error: genError } = await supabase.rpc('generate_corvee_steps', {
        p_household_id: householdId,
        p_week_start: weekStart,
      })
      if (genError) console.error('generate_corvee_steps error:', genError)

      const { data: corvees, error: fetchError } = await supabase.rpc('get_weekly_corvee', {
        p_household_id: householdId,
        p_week_start: weekStart,
      })
      if (fetchError) console.error('get_weekly_corvee error:', fetchError)
      corveeData = corvees || []
    } catch (error) {
      console.error('Corvees fetch failed:', error)
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

  // Format today's date in French
  const todayFormatted = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <div className="min-h-screen relative bg-background">

      <div className="relative z-10 max-w-app mx-auto px-3.5 pb-10">
        {/* Header */}
        <header className="pt-5 pb-3 flex justify-between items-end">
          <div>
            <p className="font-sans text-[11px] font-semibold text-foreground/30 uppercase tracking-[0.15em]">
              {todayFormatted}
            </p>
            <h1 className="font-serif text-[38px] font-black leading-none mt-0.5 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent" style={{ letterSpacing: '-0.03em' }}>
              the keep
            </h1>
          </div>
          <div className="relative mb-1">
            <div className="w-[46px] h-[46px] rounded-2xl flex items-center justify-center font-sans text-base font-extrabold shadow-md" style={{ background: 'linear-gradient(145deg, hsl(24,55%,80%), hsl(20,50%,72%))', color: 'hsl(24,45%,38%)' }}>
              {(profile?.display_name || 'A')[0].toUpperCase()}
            </div>
            <div className="absolute top-[-2px] right-[-2px] w-3 h-3 rounded-full bg-green border-[2.5px] border-background" />
          </div>
        </header>

        <div className="space-y-3.5">

        {/* Quick access buttons */}
        <QuickAccessBar
          userId={user?.id || ''}
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

        {/* Bento Stats */}
        <XpHeroCard
          totalXp={profile?.total_points || 0}
          done={weekTasks.filter((t: any) => t.status === 'completed').length}
          total={weekTasks.length}
          streak={profile?.current_streak || 0}
          level={profile?.current_level || 1}
          habitants={leaderboard.length}
          habitantInitials={leaderboard.slice(0, 3).map((m: any) => ((m.profiles as any)?.display_name || '?')[0].toUpperCase())}
        />

        {/* Corvée (carte au trésor) + Péripéties (carousel) */}
        {(() => {
          // Filter péripéties: today's completed + today's pending + 5 next future
          const todayDate = new Date().toISOString().split('T')[0]
          const todayDone = weekTasks.filter((t: any) =>
            (t.status === 'completed' || t.status === 'skipped') && t.scheduled_date <= todayDate
          )
          const todayPending = weekTasks.filter((t: any) =>
            (t.status === 'pending' || t.status === 'in_progress') && t.scheduled_date <= todayDate
          )
          const futureLocked = weekTasks
            .filter((t: any) => t.status === 'pending' && t.scheduled_date > todayDate)
            .slice(0, 5)
          const peripetiesForCarousel = [...todayDone, ...todayPending, ...futureLocked]

          return (corveeData.length > 0 || peripetiesForCarousel.length > 0) ? (
            <MaisonQuestsSection corveeData={corveeData} peripeties={peripetiesForCarousel} userId={user?.id || ''} householdId={householdId || ''} />
          ) : null
        })()}

        {/* Consecration carousel - validate others' tasks */}
        {pendingValidation.length > 0 && user?.id && (
          <ConsecrationCarousel tasks={pendingValidation} userId={user.id} />
        )}

        {/* Empty / onboarding */}
        {(!memberships || memberships.length === 0) && (
          <div className="text-center py-16 space-y-4">
            <div className="text-4xl opacity-40">🏰</div>
            <h2 className="font-serif text-xl text-foreground font-semibold">Fondez votre cite</h2>
            <p className="font-sans text-[14px] text-foreground/30 max-w-xs mx-auto">
              Creez ou rejoignez une cite pour demarrer vos quetes
            </p>
            <Link href="/household/setup">
              <Button className="mt-4">Commencer</Button>
            </Link>
          </div>
        )}

        {householdId && !householdHasTasks && (
          <Link href="/questionnaire">
            <div className="group flex items-center gap-4 py-4 border-b border-border/60 transition-colors duration-200">
              <span className="text-xl opacity-40">📜</span>
              <div>
                <p className="font-sans font-semibold text-[14px] text-foreground/60 group-hover:text-foreground transition-colors duration-200">
                  Questionnaire initial
                </p>
                <p className="font-sans text-[12px] text-foreground/25">
                  Personnalisez vos quetes
                </p>
              </div>
            </div>
          </Link>
        )}
        </div>
      </div>
    </div>
  )
}
