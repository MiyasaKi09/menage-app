/**
 * Schéma du questionnaire pour déterminer les tâches pertinentes pour un foyer
 * Version 2.0 - Compatible avec les 97 conditions du référentiel PDF
 */

export type QuestionType = 'single' | 'multiple' | 'number' | 'boolean'

export interface QuestionOption {
  value: string
  label: string
  description?: string
}

export interface Question {
  id: string
  type: QuestionType
  question: string
  description?: string
  options?: QuestionOption[]
  min?: number
  max?: number
  conditionalOn?: { field: string; value: string | string[] | boolean }
}

/**
 * Interface complète des réponses au questionnaire
 * Correspond aux colonnes de la table profile_questionnaire
 */
export interface QuestionnaireResponses {
  household_id: string

  // ========================================
  // HOUSING - Logement
  // ========================================
  housing_type: 'apartment' | 'house'
  room_count: number
  has_stairs: boolean
  has_fireplace: boolean
  has_dressing: boolean
  has_office: boolean

  // ========================================
  // KITCHEN - Équipements cuisine (multi-select)
  // ========================================
  /** Valeurs: toaster, food_processor, thermomix, plancha_bbq, compost, pantry, dishwasher, oven, microwave, hood, freezer */
  kitchen_equipment: string[]
  cooking_frequency: 'never' | 'rare' | 'regular' | 'daily'

  // ========================================
  // BATHROOM - Salle de bain
  // ========================================
  bathroom_count: number
  /** Valeurs: shower_door, shower_curtain, bidet, bath_mat, bathtub */
  bathroom_features: string[]

  // ========================================
  // LAUNDRY - Buanderie (multi-select)
  // ========================================
  has_washing_machine: boolean
  has_dryer: boolean
  /** Valeurs: ironing, outdoor_clothes */
  laundry_features: string[]

  // ========================================
  // FURNITURE - Mobilier (multi-select)
  // ========================================
  /** Valeurs: wood_furniture, leather_sofa, fabric_sofa, rugs, curtains, blinds */
  furniture_types: string[]
  floor_type: 'tile' | 'wood' | 'carpet' | 'mixed'

  // ========================================
  // ROBOTS - Robots ménagers (multi-select)
  // ========================================
  /** Valeurs: vacuum, mop, self_empty, window, lawn_mower */
  robots: string[]

  // ========================================
  // OUTDOOR - Extérieur
  // ========================================
  has_outdoor_space: boolean
  outdoor_type?: 'balcony' | 'garden' | 'terrace'
  /** Valeurs: lawn, hedges, gutters, bbq, pool, jacuzzi, garage, vegetable_garden, garden_furniture, garden_shed */
  outdoor_features: string[]

  // ========================================
  // ANIMALS - Animaux (multi-select, remplace has_pets)
  // ========================================
  /** Valeurs: cat, dog, aquarium, rodent_bird, reptile */
  animals: string[]

  // ========================================
  // CHILDREN - Enfants
  // ========================================
  has_children: boolean
  has_baby: boolean
  children_play_outside: boolean

  // ========================================
  // LIFESTYLE - Mode de vie
  // ========================================
  household_size: number
  is_shared_housing: boolean
  works_from_home: boolean

  // ========================================
  // ENVIRONMENT - Environnement
  // ========================================
  water_hardness: 'soft' | 'medium' | 'hard'
  high_dust_area: boolean
  high_pollen_area: boolean
  allergies: string[]

  // ========================================
  // PREFERENCES - Préférences
  // ========================================
  cleanliness_level: 1 | 2 | 3 | 4 | 5
  available_minutes_daily: number
}

/**
 * Questionnaire en 14 étapes pour capturer les 97 conditions
 * UX optimisée avec questions groupées et conditionnelles
 */
export const QUESTIONNAIRE: Question[] = [
  // ========================================
  // ÉTAPE 1: Type de logement
  // ========================================
  {
    id: 'housing_type',
    type: 'single',
    question: 'Quel type de logement habitez-vous ?',
    description: 'Cela détermine les tâches spécifiques à votre habitat',
    options: [
      { value: 'apartment', label: 'Appartement' },
      { value: 'house', label: 'Maison' },
    ],
  },

  // ========================================
  // ÉTAPE 2: Nombre de pièces
  // ========================================
  {
    id: 'room_count',
    type: 'number',
    question: 'Combien de pièces principales avez-vous ?',
    description: 'Chambres, salon, bureau, etc. (hors cuisine et SDB)',
    min: 1,
    max: 15,
  },

  // ========================================
  // ÉTAPE 3: Pièces et espaces spéciaux
  // ========================================
  {
    id: 'special_spaces',
    type: 'multiple',
    question: 'Quels espaces spéciaux avez-vous ?',
    description: 'Sélectionnez tous les espaces qui s\'appliquent',
    options: [
      { value: 'stairs', label: 'Escaliers', description: 'Intérieurs ou extérieurs' },
      { value: 'fireplace', label: 'Cheminée / Poêle', description: 'Insert, cheminée ouverte ou poêle' },
      { value: 'dressing', label: 'Dressing', description: 'Pièce ou placard dédié' },
      { value: 'office', label: 'Bureau / Espace de travail', description: 'Télétravail ou bureau dédié' },
    ],
  },

  // ========================================
  // ÉTAPE 4: Équipements cuisine
  // ========================================
  {
    id: 'kitchen_equipment',
    type: 'multiple',
    question: 'Quels équipements de cuisine avez-vous ?',
    description: 'Sélectionnez tout ce qui s\'applique',
    options: [
      { value: 'oven', label: 'Four', description: 'Four traditionnel ou combiné' },
      { value: 'microwave', label: 'Micro-ondes' },
      { value: 'hood', label: 'Hotte aspirante' },
      { value: 'dishwasher', label: 'Lave-vaisselle' },
      { value: 'freezer', label: 'Congélateur', description: 'Séparé ou combiné' },
      { value: 'toaster', label: 'Grille-pain' },
      { value: 'food_processor', label: 'Robot de cuisine', description: 'Mixeur, blender, etc.' },
      { value: 'thermomix', label: 'Robot cuiseur', description: 'Thermomix ou équivalent' },
      { value: 'plancha_bbq', label: 'Plancha / BBQ intérieur' },
      { value: 'compost', label: 'Compost / Poubelle bio' },
      { value: 'pantry', label: 'Garde-manger', description: 'Placard ou pièce de stockage' },
    ],
  },

  // ========================================
  // ÉTAPE 5: Fréquence de cuisine
  // ========================================
  {
    id: 'cooking_frequency',
    type: 'single',
    question: 'À quelle fréquence cuisinez-vous ?',
    options: [
      { value: 'never', label: 'Jamais', description: 'Restauration uniquement' },
      { value: 'rare', label: 'Rarement', description: '1-2 fois par semaine' },
      { value: 'regular', label: 'Régulièrement', description: '3-5 fois par semaine' },
      { value: 'daily', label: 'Tous les jours' },
    ],
  },

  // ========================================
  // ÉTAPE 6: Salles de bain
  // ========================================
  {
    id: 'bathroom_count',
    type: 'number',
    question: 'Combien de salles de bain/douche avez-vous ?',
    min: 1,
    max: 5,
  },
  {
    id: 'bathroom_features',
    type: 'multiple',
    question: 'Quels équipements dans vos salles de bain ?',
    options: [
      { value: 'bathtub', label: 'Baignoire' },
      { value: 'shower_door', label: 'Paroi de douche en verre' },
      { value: 'shower_curtain', label: 'Rideau de douche' },
      { value: 'bidet', label: 'Bidet' },
      { value: 'bath_mat', label: 'Tapis de bain' },
    ],
  },

  // ========================================
  // ÉTAPE 7: Buanderie
  // ========================================
  {
    id: 'laundry_equipment',
    type: 'multiple',
    question: 'Quels équipements de buanderie avez-vous ?',
    options: [
      { value: 'washing_machine', label: 'Lave-linge' },
      { value: 'dryer', label: 'Sèche-linge' },
      { value: 'ironing', label: 'Fer à repasser / Centrale vapeur' },
      { value: 'outdoor_clothes', label: 'Vêtements techniques / outdoor', description: 'Ski, randonnée, sport...' },
    ],
  },

  // ========================================
  // ÉTAPE 8: Mobilier et sols
  // ========================================
  {
    id: 'floor_type',
    type: 'single',
    question: 'Quel est le type de sol majoritaire ?',
    options: [
      { value: 'tile', label: 'Carrelage' },
      { value: 'wood', label: 'Parquet / Bois' },
      { value: 'carpet', label: 'Moquette' },
      { value: 'mixed', label: 'Mixte (plusieurs types)' },
    ],
  },
  {
    id: 'furniture_types',
    type: 'multiple',
    question: 'Quels types de mobilier avez-vous ?',
    options: [
      { value: 'wood_furniture', label: 'Meubles en bois', description: 'Nécessitent un entretien spécifique' },
      { value: 'leather_sofa', label: 'Canapé en cuir' },
      { value: 'fabric_sofa', label: 'Canapé en tissu' },
      { value: 'rugs', label: 'Tapis / Moquettes' },
      { value: 'curtains', label: 'Rideaux / Voilages' },
      { value: 'blinds', label: 'Stores / Volets' },
    ],
  },

  // ========================================
  // ÉTAPE 9: Robots ménagers
  // ========================================
  {
    id: 'robots',
    type: 'multiple',
    question: 'Avez-vous des robots ménagers ?',
    description: 'Ils nécessitent un entretien régulier',
    options: [
      { value: 'vacuum', label: 'Robot aspirateur', description: 'Roomba, Dyson, etc.' },
      { value: 'mop', label: 'Robot laveur', description: 'iRobot Braava, etc.' },
      { value: 'self_empty', label: 'Station auto-vidage', description: 'Pour robot aspirateur' },
      { value: 'window', label: 'Robot lave-vitres' },
      { value: 'lawn_mower', label: 'Robot tondeuse' },
    ],
  },

  // ========================================
  // ÉTAPE 10: Espace extérieur
  // ========================================
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
    id: 'outdoor_features',
    type: 'multiple',
    question: 'Quels éléments dans votre espace extérieur ?',
    description: 'Sélectionnez tout ce qui s\'applique',
    conditionalOn: { field: 'has_outdoor_space', value: ['balcony', 'terrace', 'garden'] },
    options: [
      { value: 'lawn', label: 'Pelouse' },
      { value: 'hedges', label: 'Haies / Arbustes' },
      { value: 'vegetable_garden', label: 'Potager' },
      { value: 'garden_furniture', label: 'Mobilier de jardin' },
      { value: 'garden_shed', label: 'Abri de jardin / Cabanon' },
      { value: 'bbq', label: 'Barbecue / Plancha extérieure' },
      { value: 'pool', label: 'Piscine' },
      { value: 'jacuzzi', label: 'Jacuzzi / Spa' },
      { value: 'gutters', label: 'Gouttières' },
      { value: 'garage', label: 'Garage' },
    ],
  },

  // ========================================
  // ÉTAPE 11: Animaux
  // ========================================
  {
    id: 'animals',
    type: 'multiple',
    question: 'Avez-vous des animaux de compagnie ?',
    description: 'Chaque type génère des tâches spécifiques',
    options: [
      { value: 'none', label: 'Aucun animal' },
      { value: 'cat', label: 'Chat(s)' },
      { value: 'dog', label: 'Chien(s)' },
      { value: 'aquarium', label: 'Aquarium / Poissons' },
      { value: 'rodent_bird', label: 'Rongeurs / Oiseaux', description: 'Hamster, lapin, perruche...' },
      { value: 'reptile', label: 'Reptiles', description: 'Terrarium, vivarium' },
    ],
  },

  // ========================================
  // ÉTAPE 12: Enfants
  // ========================================
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
    id: 'children_details',
    type: 'multiple',
    question: 'Précisions sur les enfants',
    conditionalOn: { field: 'has_children', value: 'yes' },
    options: [
      { value: 'baby', label: 'Bébé (0-2 ans)', description: 'Nécessite stérilisation, etc.' },
      { value: 'plays_outside', label: 'Jouent à l\'extérieur', description: 'Génère plus de nettoyage' },
    ],
  },

  // ========================================
  // ÉTAPE 13: Mode de vie
  // ========================================
  {
    id: 'household_size',
    type: 'number',
    question: 'Combien de personnes vivent dans le foyer ?',
    min: 1,
    max: 15,
  },
  {
    id: 'lifestyle',
    type: 'multiple',
    question: 'Votre mode de vie',
    options: [
      { value: 'shared_housing', label: 'Colocation', description: 'Espaces communs partagés' },
      { value: 'works_from_home', label: 'Télétravail', description: 'Bureau à domicile régulier' },
    ],
  },

  // ========================================
  // ÉTAPE 14: Environnement et préférences
  // ========================================
  {
    id: 'water_hardness',
    type: 'single',
    question: 'Quelle est la dureté de votre eau ?',
    description: 'Influence la fréquence de détartrage',
    options: [
      { value: 'soft', label: 'Douce', description: 'Peu de calcaire' },
      { value: 'medium', label: 'Moyenne', description: 'Calcaire modéré' },
      { value: 'hard', label: 'Dure', description: 'Beaucoup de calcaire' },
    ],
  },
  {
    id: 'environment',
    type: 'multiple',
    question: 'Votre environnement',
    options: [
      { value: 'high_dust', label: 'Zone poussiéreuse', description: 'Bord de route, travaux...' },
      { value: 'high_pollen', label: 'Zone pollinique', description: 'Campagne, arbres proches' },
    ],
  },
  {
    id: 'allergies',
    type: 'multiple',
    question: 'Y a-t-il des allergies dans le foyer ?',
    description: 'Augmente la fréquence de certaines tâches',
    options: [
      { value: 'none', label: 'Aucune allergie' },
      { value: 'dust', label: 'Poussière / Acariens' },
      { value: 'pollen', label: 'Pollen' },
      { value: 'mold', label: 'Moisissures' },
      { value: 'pets', label: 'Poils d\'animaux' },
    ],
  },
  {
    id: 'cleanliness_level',
    type: 'single',
    question: 'Quel est votre niveau d\'exigence de propreté ?',
    description: 'Ajuste la fréquence et le nombre de tâches',
    options: [
      { value: '1', label: 'Très relax', description: 'Nettoyage minimal' },
      { value: '2', label: 'Relax', description: 'L\'essentiel uniquement' },
      { value: '3', label: 'Standard', description: 'Équilibré' },
      { value: '4', label: 'Exigeant', description: 'Propre régulièrement' },
      { value: '5', label: 'Très exigeant', description: 'Impeccable en permanence' },
    ],
  },
  {
    id: 'available_minutes_daily',
    type: 'single',
    question: 'Combien de minutes par jour pour le ménage ?',
    description: 'Temps moyen disponible pour tous les membres du foyer',
    options: [
      { value: '15', label: '15 minutes', description: 'Minimum' },
      { value: '30', label: '30 minutes', description: 'Léger' },
      { value: '45', label: '45 minutes', description: 'Modéré' },
      { value: '60', label: '1 heure', description: 'Standard' },
      { value: '90', label: '1h30', description: 'Intensif' },
      { value: '120', label: '2 heures+', description: 'Très intensif' },
    ],
  },
]

/**
 * Valeurs par défaut pour un nouveau questionnaire
 */
export const DEFAULT_QUESTIONNAIRE_RESPONSES: Partial<QuestionnaireResponses> = {
  housing_type: 'apartment',
  room_count: 3,
  has_stairs: false,
  has_fireplace: false,
  has_dressing: false,
  has_office: false,
  kitchen_equipment: [],
  cooking_frequency: 'regular',
  bathroom_count: 1,
  bathroom_features: [],
  has_washing_machine: true,
  has_dryer: false,
  laundry_features: [],
  furniture_types: [],
  floor_type: 'tile',
  robots: [],
  has_outdoor_space: false,
  outdoor_features: [],
  animals: [],
  has_children: false,
  has_baby: false,
  children_play_outside: false,
  household_size: 2,
  is_shared_housing: false,
  works_from_home: false,
  water_hardness: 'medium',
  high_dust_area: false,
  high_pollen_area: false,
  allergies: [],
  cleanliness_level: 3,
  available_minutes_daily: 45,
}
