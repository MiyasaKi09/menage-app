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
    <div className="min-h-screen bg-gradient-to-br from-deep-green to-deep-blue relative overflow-hidden">
      <GrainOverlay opacity={0.08} />
      <DiagonalStripe position="top-right" />

      <div className="relative z-10 p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="font-medieval text-xs opacity-50 tracking-wider mb-1 text-cream">
            {householdName}
          </div>
          <h1 className="font-cinzel text-4xl md:text-5xl text-cream font-bold leading-none mb-4">
            Questionnaire
          </h1>
          <p className="font-lora text-cream opacity-80 text-lg">
            {existingResponse
              ? 'Modifiez vos reponses pour ajuster les quetes de votre cite'
              : 'Repondez a quelques questions pour personnaliser les quetes de votre cite'}
          </p>
        </div>

        {/* Infobox */}
        <div className="border border-yellow/20 bg-yellow/15 p-6 rounded-lg shadow-golden">
          <GrainOverlay opacity={0.03} />
          <div className="relative z-10">
            <h2 className="font-cinzel text-xl font-bold mb-2">Comment ca marche ?</h2>
            <ul className="font-lora space-y-2 text-sm">
              <li>Nous creons automatiquement les quetes adaptees a votre cite</li>
              <li>Les pieces d&apos;or sont ajustees selon la complexite de votre logement</li>
              <li>Vous pourrez toujours modifier vos reponses plus tard</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <QuestionnaireForm householdId={householdId} userId={user.id} />
      </div>
    </div>
  )
}
