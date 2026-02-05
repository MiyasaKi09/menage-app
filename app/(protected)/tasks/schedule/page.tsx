import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScheduleView } from '@/components/tasks/ScheduleView'

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const supabase = await createClient()

  // 1. Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get household membership
  const { data: memberships } = await supabase
    .from('household_members')
    .select(`
      household_id,
      households (
        id,
        name
      )
    `)
    .eq('profile_id', user.id)

  if (!memberships || memberships.length === 0) {
    redirect('/household/setup')
  }

  const householdId = memberships[0].household_id
  const householdName = (memberships[0].households as any)?.name || 'Mon Foyer'

  // 3. Parse target date (defaults to today)
  const targetDateStr = searchParams.date || new Date().toISOString().split('T')[0]
  const targetDate = new Date(targetDateStr)

  // Validate date
  if (isNaN(targetDate.getTime())) {
    redirect('/tasks/schedule') // Invalid date, redirect to today
  }

  // 4. Handle late tasks from yesterday (automatic rollover)
  const yesterday = new Date(targetDate)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // Only handle late tasks if we're viewing today or future
  const today = new Date().toISOString().split('T')[0]
  if (targetDateStr >= today) {
    try {
      await supabase.rpc('handle_late_tasks', {
        p_household_id: householdId,
        p_current_date: yesterdayStr
      })
    } catch (error) {
      console.error('Error handling late tasks:', error)
      // Non-blocking - continue even if this fails
    }
  }

  // 5. Generate schedule for target date if needed
  try {
    const { data: scheduleResult, error: generateError } = await supabase.rpc('generate_daily_schedule', {
      p_household_id: householdId,
      p_target_date: targetDateStr
    })

    if (generateError) {
      console.error('Error generating schedule:', generateError)
    } else {
      console.log('Schedule generation result:', scheduleResult)
    }
  } catch (error) {
    console.error('Error calling generate_daily_schedule:', error)
    // Non-blocking - schedule might already exist
  }

  // 6. Fetch schedule for next 7 days
  const endDate = new Date(targetDate)
  endDate.setDate(endDate.getDate() + 6) // +6 days = 7 days total
  const endDateStr = endDate.toISOString().split('T')[0]

  const { data: schedule, error: scheduleError } = await supabase.rpc('get_schedule_for_dates', {
    p_household_id: householdId,
    p_start_date: targetDateStr,
    p_end_date: endDateStr
  })

  if (scheduleError) {
    console.error('Error fetching schedule:', scheduleError)
  }

  // 7. Render schedule view
  return (
    <ScheduleView
      schedule={schedule || []}
      householdId={householdId}
      householdName={householdName}
      userId={user.id}
      currentDate={targetDateStr}
    />
  )
}

// Enable dynamic rendering (don't cache this page)
export const dynamic = 'force-dynamic'
export const revalidate = 0
