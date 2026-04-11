import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function TaskHistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer l'historique des tâches de l'utilisateur
  // On utilise task_name et category_name stockés directement dans task_history
  const { data: history } = await supabase
    .from('task_history')
    .select(`
      id,
      completed_at,
      points_earned,
      task_name,
      category_name,
      households (
        name
      )
    `)
    .eq('profile_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-app mx-auto px-3.5 py-6 pb-24 space-y-6">
        <div>
          <Link href="/maison" className="font-sans text-[11px] text-foreground/25 hover:text-foreground/40 transition-colors">
            ← Retour
          </Link>
          <h1 className="font-serif text-[28px] font-black text-foreground mt-1">Historique</h1>
          <p className="font-sans text-[12px] text-foreground/30">
            Les 50 dernieres quetes completees
          </p>
        </div>

        {!history || history.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-3xl opacity-30">📜</div>
            <p className="font-sans text-[14px] text-foreground/30">Aucune quete completee</p>
            <Link href="/maison">
              <Button className="mt-2">Retour aux quetes</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {history.map((entry: any) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/60 border border-border/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-[13px] text-foreground/60 truncate">
                    {entry.task_name || 'Quete'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {entry.category_name && <span className="font-sans text-[10px] text-foreground/25">{entry.category_name}</span>}
                    <span className="font-sans text-[10px] text-foreground/20">
                      {new Date(entry.completed_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <span className="font-sans font-bold text-[13px] text-yellow/60 ml-3">
                  +{entry.points_earned} or
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
