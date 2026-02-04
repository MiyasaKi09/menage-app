import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm'
import { DiagonalStripe } from '@/components/ui/DiagonalStripe'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export default async function QuestionnairePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupérer les foyers de l'utilisateur
  const { data: memberships } = await supabase
    .from('household_members')
    .select(`
      household_id,
      role,
      households (
        id,
        name
      )
    `)
    .eq('profile_id', user.id)

  // Si l'utilisateur n'a pas de foyer, rediriger vers la création
  if (!memberships || memberships.length === 0) {
    redirect('/household/setup')
  }

  // Utiliser le premier foyer par défaut
  const householdId = memberships[0].household_id
  const householdName = (memberships[0].households as any)?.name

  // Vérifier si le questionnaire a déjà été rempli
  const { data: existingResponse } = await supabase
    .from('questionnaire_responses')
    .select('id')
    .eq('household_id', householdId)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-green to-[#062818] relative overflow-hidden">
      <GrainOverlay />
      <DiagonalStripe position="top-right" colors={['#00e676', '#ffe14f', '#00b4ff']} />

      <div className="relative z-10 p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="font-space-mono text-xs opacity-50 uppercase tracking-wider mb-1 text-cream">
            {householdName}
          </div>
          <h1 className="font-anton text-4xl md:text-5xl text-cream uppercase leading-none mb-4">
            QUESTIONNAIRE
          </h1>
          <p className="font-outfit text-cream opacity-80 text-lg">
            {existingResponse
              ? 'Modifiez vos réponses pour ajuster les tâches de votre foyer'
              : 'Répondez à quelques questions pour personnaliser les tâches de votre foyer'}
          </p>
        </div>

        {/* Infobox */}
        <div className="border-4 border-black bg-yellow p-6 shadow-brutal">
          <GrainOverlay opacity={0.03} />
          <div className="relative z-10">
            <h2 className="font-anton text-xl uppercase mb-2">💡 Comment ça marche ?</h2>
            <ul className="font-outfit space-y-2 text-sm">
              <li>✅ Nous créons automatiquement les tâches adaptées à votre foyer</li>
              <li>📊 Les points sont ajustés selon la complexité de votre logement</li>
              <li>🔄 Vous pourrez toujours modifier vos réponses plus tard</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <QuestionnaireForm householdId={householdId} userId={user.id} />
      </div>
    </div>
  )
}
