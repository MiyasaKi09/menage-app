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
  // Nouvelles questions enrichies
  has_robot_vacuum?: boolean
  has_ac?: boolean
  bathroom_count?: number
  has_ventilation?: boolean
  cleanliness_level?: number // 1-5: 1=relax, 5=maniaque
  available_minutes_daily?: number // 15-120 minutes
  water_hardness?: 'soft' | 'medium' | 'hard'
  floor_type?: 'tile' | 'wood' | 'carpet' | 'mixed'
  allergies?: string[]
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
      { value: 'robot_vacuum', label: 'Robot aspirateur' },
      { value: 'ac', label: 'Climatisation' },
      { value: 'ventilation', label: 'VMC/Extracteurs d\'air' },
    ],
  },
  {
    id: 'bathroom_count',
    type: 'number',
    question: 'Combien de salles de bain/douches ?',
    description: 'Nombre total de salles d\'eau (baignoire ou douche)',
    min: 1,
    max: 4,
  },
  {
    id: 'cleanliness_level',
    type: 'single',
    question: 'Quel est votre niveau d\'exigence de propreté ?',
    description: 'Cela permet d\'ajuster la fréquence et le nombre de tâches',
    options: [
      { value: '1', label: '1 - Très relax (nettoyage minimal)' },
      { value: '2', label: '2 - Relax (essentiel uniquement)' },
      { value: '3', label: '3 - Standard (équilibré)' },
      { value: '4', label: '4 - Exigeant (propre régulièrement)' },
      { value: '5', label: '5 - Très exigeant (impeccable)' },
    ],
  },
  {
    id: 'available_minutes_daily',
    type: 'single',
    question: 'Combien de minutes par jour pouvez-vous consacrer au ménage ?',
    description: 'En moyenne, sur tous les membres du foyer',
    options: [
      { value: '15', label: '15 minutes (minimum)' },
      { value: '30', label: '30 minutes (léger)' },
      { value: '45', label: '45 minutes (modéré)' },
      { value: '60', label: '1 heure (standard)' },
      { value: '90', label: '1h30 (intensif)' },
      { value: '120', label: '2 heures+ (très intensif)' },
    ],
  },
  {
    id: 'water_hardness',
    type: 'single',
    question: 'Quelle est la dureté de votre eau ?',
    description: 'Cela influence le détartrage nécessaire',
    options: [
      { value: 'soft', label: 'Douce (peu de calcaire)' },
      { value: 'medium', label: 'Moyenne (calcaire modéré)' },
      { value: 'hard', label: 'Dure (beaucoup de calcaire)' },
      { value: 'unknown', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'floor_type',
    type: 'single',
    question: 'Quel est le type de sol majoritaire ?',
    options: [
      { value: 'tile', label: 'Carrelage' },
      { value: 'wood', label: 'Parquet/bois' },
      { value: 'carpet', label: 'Moquette' },
      { value: 'mixed', label: 'Mixte' },
    ],
  },
  {
    id: 'allergies',
    type: 'multiple',
    question: 'Y a-t-il des allergies dans le foyer ?',
    description: 'Certaines tâches seront ajustées en conséquence',
    options: [
      { value: 'none', label: 'Aucune allergie' },
      { value: 'dust', label: 'Poussière/acariens' },
      { value: 'pollen', label: 'Pollen' },
      { value: 'mold', label: 'Moisissures' },
      { value: 'pets', label: 'Poils d\'animaux' },
    ],
  },
]
