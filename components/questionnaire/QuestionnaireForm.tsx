'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { QUESTIONNAIRE, type Question } from '@/lib/questionnaire/schema'
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

  const currentQuestion = QUESTIONNAIRE[currentStep]
  const isLastStep = currentStep === QUESTIONNAIRE.length - 1

  const handleAnswer = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentStep < QUESTIONNAIRE.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Transformer les réponses en format attendu
      const formattedResponses = {
        household_id: householdId,
        housing_type: responses.housing_type || 'apartment',
        room_count: Number(responses.room_count) || 1,
        has_outdoor_space: responses.has_outdoor_space !== 'no',
        outdoor_type:
          responses.has_outdoor_space !== 'no'
            ? responses.has_outdoor_space
            : undefined,
        has_pets: !responses.has_pets?.includes('none'),
        pet_types: responses.has_pets?.filter((p: string) => p !== 'none') || [],
        household_size: Number(responses.household_size) || 1,
        has_children: responses.has_children === 'yes',
        cooking_frequency: responses.cooking_frequency || 'regular',
        has_dishwasher: responses.equipment?.includes('dishwasher') || false,
        has_washing_machine: responses.equipment?.includes('washing_machine') || false,
        has_dryer: responses.equipment?.includes('dryer') || false,
      }

      const result = await applyQuestionnaire(
        supabase,
        formattedResponses,
        userId
      )

      if (result.success) {
        // Rediriger vers la page des tâches
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
              className={`flex items-center p-4 border-4 border-black cursor-pointer transition-all ${
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
            return (
              <label
                key={option.value}
                className={`flex items-center p-4 border-4 border-black cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-yellow shadow-brutal'
                    : 'bg-off-white hover:translate-x-1'
                }`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={isChecked}
                  onChange={(e) => {
                    const newValue = currentValue || []
                    if (e.target.checked) {
                      handleAnswer(question.id, [...newValue, option.value])
                    } else {
                      handleAnswer(
                        question.id,
                        newValue.filter((v: string) => v !== option.value)
                      )
                    }
                  }}
                  className="sr-only"
                />
                <span className="font-outfit font-bold">{option.label}</span>
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

  const canProgress = responses[currentQuestion.id] !== undefined

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="border-4 border-black bg-off-white overflow-hidden">
        <div
          className="h-3 bg-yellow transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / QUESTIONNAIRE.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Question {currentStep + 1} / {QUESTIONNAIRE.length}
            </CardTitle>
            <div className="font-space-mono text-xs opacity-60">
              {Math.round(((currentStep + 1) / QUESTIONNAIRE.length) * 100)}%
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
            Précédent
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
    </div>
  )
}
