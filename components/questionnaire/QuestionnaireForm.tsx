'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { QUESTIONNAIRE, type Question, type QuestionnaireResponses } from '@/lib/questionnaire/schema'
import { applyQuestionnaire } from '@/lib/questionnaire/apply-questionnaire'
import { Spinner } from '@/components/ui/Spinner'

interface QuestionnaireFormProps {
  householdId: string
  userId: string
}

export function QuestionnaireForm({ householdId, userId }: QuestionnaireFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtrer les questions selon les conditions
  const visibleQuestions = useMemo(() => {
    return QUESTIONNAIRE.filter(question => {
      if (!question.conditionalOn) return true

      const { field, value } = question.conditionalOn
      const currentValue = responses[field]

      if (Array.isArray(value)) {
        return value.includes(currentValue)
      }
      if (typeof value === 'boolean') {
        return currentValue === value
      }
      return currentValue === value
    })
  }, [responses])

  const currentQuestion = visibleQuestions[currentStep]
  const isLastStep = currentStep === visibleQuestions.length - 1
  const progress = ((currentStep + 1) / visibleQuestions.length) * 100

  const handleAnswer = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Transformer les réponses brutes en format QuestionnaireResponses
  const formatResponses = (): Partial<QuestionnaireResponses> => {
    // Extraire les espaces spéciaux
    const specialSpaces = responses.special_spaces || []

    // Extraire les équipements de buanderie
    const laundryEquipment = responses.laundry_equipment || []

    // Extraire les détails enfants
    const childrenDetails = responses.children_details || []

    // Extraire le mode de vie
    const lifestyle = responses.lifestyle || []

    // Extraire l'environnement
    const environment = responses.environment || []

    return {
      household_id: householdId,

      // HOUSING
      housing_type: responses.housing_type || 'apartment',
      room_count: Number(responses.room_count) || 3,
      has_stairs: specialSpaces.includes('stairs'),
      has_fireplace: specialSpaces.includes('fireplace'),
      has_dressing: specialSpaces.includes('dressing'),
      has_office: specialSpaces.includes('office'),

      // KITCHEN
      kitchen_equipment: responses.kitchen_equipment || [],
      cooking_frequency: responses.cooking_frequency || 'regular',

      // BATHROOM
      bathroom_count: Number(responses.bathroom_count) || 1,
      bathroom_features: responses.bathroom_features || [],

      // LAUNDRY
      has_washing_machine: laundryEquipment.includes('washing_machine'),
      has_dryer: laundryEquipment.includes('dryer'),
      laundry_features: laundryEquipment.filter((e: string) =>
        ['ironing', 'outdoor_clothes'].includes(e)
      ),

      // FURNITURE
      furniture_types: responses.furniture_types || [],
      floor_type: responses.floor_type || 'tile',

      // ROBOTS
      robots: responses.robots || [],

      // OUTDOOR
      has_outdoor_space: responses.has_outdoor_space !== 'no',
      outdoor_type: responses.has_outdoor_space !== 'no'
        ? responses.has_outdoor_space as 'balcony' | 'garden' | 'terrace'
        : undefined,
      outdoor_features: responses.outdoor_features || [],

      // ANIMALS
      animals: (responses.animals || []).filter((a: string) => a !== 'none'),

      // CHILDREN
      has_children: responses.has_children === 'yes',
      has_baby: childrenDetails.includes('baby'),
      children_play_outside: childrenDetails.includes('plays_outside'),

      // LIFESTYLE
      household_size: Number(responses.household_size) || 2,
      is_shared_housing: lifestyle.includes('shared_housing'),
      works_from_home: lifestyle.includes('works_from_home'),

      // ENVIRONMENT
      water_hardness: responses.water_hardness || 'medium',
      high_dust_area: environment.includes('high_dust'),
      high_pollen_area: environment.includes('high_pollen'),
      allergies: (responses.allergies || []).filter((a: string) => a !== 'none'),

      // PREFERENCES
      cleanliness_level: (Number(responses.cleanliness_level) || 3) as 1 | 2 | 3 | 4 | 5,
      available_minutes_daily: Number(responses.available_minutes_daily) || 45,
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formattedResponses = formatResponses()

      const result = await applyQuestionnaire(
        supabase,
        formattedResponses as QuestionnaireResponses,
        userId
      )

      if (result.success) {
        router.push(`/tasks?success=true&created=${result.tasksCreated}`)
        router.refresh()
      } else {
        setError(result.error || 'Une erreur est survenue')
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Une erreur inattendue est survenue')
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: Question) => {
    const currentValue = responses[question.id]

    if (question.type === 'single') {
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <label
              key={option.value}
              className={`flex flex-col p-4 border-4 border-black cursor-pointer transition-all ${
                currentValue === option.value
                  ? 'bg-yellow shadow-brutal'
                  : 'bg-off-white hover:translate-x-1'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={currentValue === option.value}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="sr-only"
              />
              <span className="font-outfit font-bold">{option.label}</span>
              {option.description && (
                <span className="font-outfit text-xs opacity-60 mt-1">
                  {option.description}
                </span>
              )}
            </label>
          ))}
        </div>
      )
    }

    if (question.type === 'multiple') {
      return (
        <div className="space-y-3">
          {question.options?.map((option) => {
            const isChecked = currentValue?.includes(option.value) || false

            // Logique spéciale pour "none" qui déselectionne les autres
            const handleMultipleChange = (checked: boolean) => {
              const newValue = currentValue || []

              if (option.value === 'none') {
                // Si on sélectionne "none", on désélectionne tout le reste
                handleAnswer(question.id, checked ? ['none'] : [])
              } else {
                // Si on sélectionne autre chose, on retire "none"
                if (checked) {
                  handleAnswer(
                    question.id,
                    [...newValue.filter((v: string) => v !== 'none'), option.value]
                  )
                } else {
                  handleAnswer(
                    question.id,
                    newValue.filter((v: string) => v !== option.value)
                  )
                }
              }
            }

            return (
              <label
                key={option.value}
                className={`flex flex-col p-4 border-4 border-black cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-yellow shadow-brutal'
                    : 'bg-off-white hover:translate-x-1'
                }`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={isChecked}
                  onChange={(e) => handleMultipleChange(e.target.checked)}
                  className="sr-only"
                />
                <span className="font-outfit font-bold">{option.label}</span>
                {option.description && (
                  <span className="font-outfit text-xs opacity-60 mt-1">
                    {option.description}
                  </span>
                )}
              </label>
            )
          })}
        </div>
      )
    }

    if (question.type === 'number') {
      return (
        <input
          type="number"
          min={question.min}
          max={question.max}
          value={currentValue || ''}
          onChange={(e) => handleAnswer(question.id, e.target.value)}
          className="w-full h-16 px-6 font-anton text-3xl text-center border-4 border-black bg-off-white focus:bg-yellow focus:outline-none focus:ring-4 focus:ring-black transition-colors"
        />
      )
    }

    return null
  }

  // Vérifier si on peut progresser
  const canProgress = useMemo(() => {
    if (!currentQuestion) return false

    const currentValue = responses[currentQuestion.id]

    // Pour les questions à choix multiples, une réponse vide est OK si c'est une question optionnelle
    if (currentQuestion.type === 'multiple') {
      // Les questions conditionnelles sont optionnelles
      if (currentQuestion.conditionalOn) return true
      return currentValue !== undefined && currentValue.length > 0
    }

    return currentValue !== undefined && currentValue !== ''
  }, [currentQuestion, responses])

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="border-4 border-black bg-off-white overflow-hidden">
        <div
          className="h-3 bg-yellow transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Question {currentStep + 1} / {visibleQuestions.length}
            </CardTitle>
            <div className="font-space-mono text-xs opacity-60">
              {Math.round(progress)}%
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="font-anton text-2xl uppercase mb-2">
              {currentQuestion.question}
            </h2>
            {currentQuestion.description && (
              <p className="font-outfit text-sm opacity-70">
                {currentQuestion.description}
              </p>
            )}
          </div>

          {renderQuestion(currentQuestion)}

          {error && (
            <div className="p-4 border-4 border-black bg-red text-white font-outfit font-bold">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-4">
        {currentStep > 0 && (
          <Button variant="outline" onClick={handlePrevious} className="flex-1">
            Precedent
          </Button>
        )}

        {!isLastStep ? (
          <Button
            onClick={handleNext}
            disabled={!canProgress}
            className="flex-1"
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProgress || isSubmitting}
            variant="success"
            className="flex-1"
          >
            {isSubmitting ? <Spinner size="sm" /> : 'Terminer'}
          </Button>
        )}
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs opacity-50">
          <summary>Debug</summary>
          <pre className="overflow-auto max-h-32">
            {JSON.stringify({ currentStep, responses }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
