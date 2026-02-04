/**
 * Schéma du questionnaire pour déterminer les tâches pertinentes pour un foyer
 */

export type QuestionType = 'single' | 'multiple' | 'number'

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: string
  type: QuestionType
  question: string
  description?: string
  options?: QuestionOption[]
  min?: number
  max?: number
}

export interface QuestionnaireResponses {
  household_id: string
  housing_type: 'apartment' | 'house'
  room_count: number
  has_outdoor_space: boolean
  outdoor_type?: 'balcony' | 'garden' | 'terrace'
  has_pets: boolean
  pet_types?: string[]
  household_size: number
  has_children: boolean
  cooking_frequency: 'never' | 'rare' | 'regular' | 'daily'
  has_dishwasher: boolean
  has_washing_machine: boolean
  has_dryer: boolean
  cleaning_preferences?: string[]
}

export const QUESTIONNAIRE: Question[] = [
  {
    id: 'housing_type',
    type: 'single',
    question: 'Quel type de logement habitez-vous ?',
    description: 'Cela nous aide à déterminer les tâches adaptées',
    options: [
      { value: 'apartment', label: 'Appartement' },
      { value: 'house', label: 'Maison' },
    ],
  },
  {
    id: 'room_count',
    type: 'number',
    question: 'Combien de pièces principales ?',
    description: 'Chambres, salon, bureau, etc.',
    min: 1,
    max: 10,
  },
  {
    id: 'has_outdoor_space',
    type: 'single',
    question: 'Avez-vous un espace extérieur ?',
    options: [
      { value: 'no', label: 'Non' },
      { value: 'balcony', label: 'Balcon' },
      { value: 'terrace', label: 'Terrasse' },
      { value: 'garden', label: 'Jardin' },
    ],
  },
  {
    id: 'has_pets',
    type: 'multiple',
    question: 'Avez-vous des animaux de compagnie ?',
    options: [
      { value: 'none', label: 'Aucun animal' },
      { value: 'dog', label: 'Chien(s)' },
      { value: 'cat', label: 'Chat(s)' },
      { value: 'other', label: 'Autre (oiseaux, rongeurs...)' },
    ],
  },
  {
    id: 'household_size',
    type: 'number',
    question: 'Combien de personnes vivent dans le foyer ?',
    min: 1,
    max: 15,
  },
  {
    id: 'has_children',
    type: 'single',
    question: 'Y a-t-il des enfants dans le foyer ?',
    options: [
      { value: 'no', label: 'Non' },
      { value: 'yes', label: 'Oui' },
    ],
  },
  {
    id: 'cooking_frequency',
    type: 'single',
    question: 'À quelle fréquence cuisinez-vous ?',
    options: [
      { value: 'never', label: 'Jamais (restauration uniquement)' },
      { value: 'rare', label: 'Rarement (1-2 fois/semaine)' },
      { value: 'regular', label: 'Régulièrement (3-5 fois/semaine)' },
      { value: 'daily', label: 'Tous les jours' },
    ],
  },
  {
    id: 'equipment',
    type: 'multiple',
    question: 'Quels équipements possédez-vous ?',
    options: [
      { value: 'dishwasher', label: 'Lave-vaisselle' },
      { value: 'washing_machine', label: 'Lave-linge' },
      { value: 'dryer', label: 'Sèche-linge' },
    ],
  },
]
