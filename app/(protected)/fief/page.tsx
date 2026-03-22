import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FiefPageClient } from '@/components/fief/FiefPageClient'

export default async function FiefPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('household_members')
    .select('id, role, household_id, households (id, name)')
    .eq('profile_id', user?.id)
    .limit(1)

  if (!memberships || memberships.length === 0) {
    redirect('/household/setup')
  }

  const membership = memberships[0]
  const householdId = (membership.households as any)?.id
  const householdName = (membership.households as any)?.name
  const isAdmin = membership.role === 'admin'

  // Fetch household tasks
  const { data: tasks } = await supabase
    .from('household_tasks')
    .select('*, categories(name, emoji), frequencies(label)')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })

  // Fetch household members
  const { data: members } = await supabase
    .from('household_members')
    .select('profile_id, role, profiles(display_name, email)')
    .eq('household_id', householdId)

  // Fetch household info (for invite code)
  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)
    .single()

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-b from-deep-green to-deep-blue transition-colors duration-700" />
      <div className="relative z-10">
        <FiefPageClient
          householdId={householdId}
          householdName={householdName}
          isAdmin={isAdmin}
          tasks={tasks || []}
          members={members || []}
          inviteCode={household?.invite_code || ''}
        />
      </div>
    </div>
  )
}
