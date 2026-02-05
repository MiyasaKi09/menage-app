/**
 * Mapping des réponses du questionnaire vers les codes de condition
 * Les condition_codes correspondent aux valeurs dans task_templates.condition_code
 * Version 2.0 - 97 conditions supportées
 */

import { QuestionnaireResponses } from './schema'

/**
 * Dérive tous les codes de condition actifs à partir des réponses au questionnaire
 * Ces codes sont utilisés pour filtrer les tâches pertinentes dans task_templates
 */
export function deriveConditionCodes(responses: QuestionnaireResponses): Set<string> {
  const conditions = new Set<string>()

  // ========================================
  // HOUSING - Logement
  // ========================================
  if (responses.housing_type === 'house') {
    conditions.add('maison')
  }
  if (responses.housing_type === 'apartment') {
    conditions.add('appartement')
  }
  if (responses.has_stairs) {
    conditions.add('escaliers')
  }
  if (responses.has_fireplace) {
    conditions.add('cheminee')
  }
  if (responses.has_dressing) {
    conditions.add('dressing')
  }
  if (responses.has_office) {
    conditions.add('bureau')
  }

  // ========================================
  // KITCHEN - Équipements cuisine
  // ========================================
  const kitchenMapping: Record<string, string> = {
    'toaster': 'grille_pain',
    'food_processor': 'robot_cuisine',
    'thermomix': 'robot_cuiseur',
    'plancha_bbq': 'plancha_bbq',
    'compost': 'compost',
    'pantry': 'garde_manger',
    'dishwasher': 'lave_vaisselle',
    'oven': 'four',
    'microwave': 'micro_ondes',
    'hood': 'hotte',
    'freezer': 'congelateur',
  }

  responses.kitchen_equipment?.forEach(equipment => {
    const code = kitchenMapping[equipment]
    if (code) conditions.add(code)
  })

  // Fréquence cuisine
  if (responses.cooking_frequency === 'daily' || responses.cooking_frequency === 'regular') {
    conditions.add('cuisine_frequente')
  }

  // ========================================
  // BATHROOM - Salle de bain
  // ========================================
  const bathroomMapping: Record<string, string> = {
    'shower_door': 'paroi_douche',
    'shower_curtain': 'rideau_douche',
    'bidet': 'bidet',
    'bath_mat': 'tapis_bain',
    'bathtub': 'baignoire',
  }

  responses.bathroom_features?.forEach(feature => {
    const code = bathroomMapping[feature]
    if (code) conditions.add(code)
  })

  // ========================================
  // LAUNDRY - Buanderie
  // ========================================
  if (responses.has_washing_machine) {
    conditions.add('lave_linge')
  }
  if (responses.has_dryer) {
    conditions.add('seche_linge')
  }

  const laundryMapping: Record<string, string> = {
    'ironing': 'repassage',
    'outdoor_clothes': 'vetements_outdoor',
  }

  responses.laundry_features?.forEach(feature => {
    const code = laundryMapping[feature]
    if (code) conditions.add(code)
  })

  // ========================================
  // FURNITURE - Mobilier
  // ========================================
  const furnitureMapping: Record<string, string> = {
    'wood_furniture': 'meubles_bois',
    'leather_sofa': 'canape_cuir',
    'fabric_sofa': 'canape_tissu',
    'rugs': 'tapis',
    'curtains': 'rideaux',
    'blinds': 'stores',
  }

  responses.furniture_types?.forEach(furniture => {
    const code = furnitureMapping[furniture]
    if (code) conditions.add(code)
  })

  // Type de sol
  const floorMapping: Record<string, string> = {
    'tile': 'sol_carrelage',
    'wood': 'sol_parquet',
    'carpet': 'sol_moquette',
    'mixed': 'sol_mixte',
  }
  if (responses.floor_type && floorMapping[responses.floor_type]) {
    conditions.add(floorMapping[responses.floor_type])
  }

  // ========================================
  // ROBOTS - Robots ménagers
  // ========================================
  const robotMapping: Record<string, string> = {
    'vacuum': 'robot_aspirateur',
    'mop': 'robot_laveur',
    'self_empty': 'robot_station_autovidage',
    'window': 'robot_vitres',
    'lawn_mower': 'robot_tondeuse',
  }

  responses.robots?.forEach(robot => {
    const code = robotMapping[robot]
    if (code) conditions.add(code)
  })

  // Si aucun robot aspirateur, ajouter la condition inverse
  if (!responses.robots?.includes('vacuum')) {
    conditions.add('pas_robot_aspirateur')
  }

  // ========================================
  // OUTDOOR - Extérieur
  // ========================================
  if (responses.has_outdoor_space) {
    conditions.add('exterieur')

    if (responses.outdoor_type === 'garden') {
      conditions.add('jardin')
    } else if (responses.outdoor_type === 'terrace') {
      conditions.add('terrasse')
    } else if (responses.outdoor_type === 'balcony') {
      conditions.add('balcon')
    }
  }

  const outdoorMapping: Record<string, string> = {
    'lawn': 'pelouse',
    'hedges': 'haies',
    'gutters': 'gouttiere',
    'bbq': 'barbecue',
    'pool': 'piscine',
    'jacuzzi': 'jacuzzi',
    'garage': 'garage',
    'vegetable_garden': 'potager',
    'garden_furniture': 'mobilier_jardin',
    'garden_shed': 'abri_jardin',
  }

  responses.outdoor_features?.forEach(feature => {
    const code = outdoorMapping[feature]
    if (code) conditions.add(code)
  })

  // ========================================
  // ANIMALS - Animaux
  // ========================================
  const animalMapping: Record<string, string> = {
    'cat': 'chat',
    'dog': 'chien',
    'aquarium': 'aquarium',
    'rodent_bird': 'rongeur_oiseau',
    'reptile': 'reptile',
  }

  const hasAnimals = responses.animals?.filter(a => a !== 'none').length > 0
  if (hasAnimals) {
    conditions.add('animaux')

    responses.animals?.forEach(animal => {
      const code = animalMapping[animal]
      if (code) conditions.add(code)
    })
  }

  // ========================================
  // CHILDREN - Enfants
  // ========================================
  if (responses.has_children) {
    conditions.add('enfants')

    if (responses.has_baby) {
      conditions.add('bebe')
    }

    if (responses.children_play_outside) {
      conditions.add('enfants_exterieur')
    }
  }

  // ========================================
  // LIFESTYLE - Mode de vie
  // ========================================
  if (responses.is_shared_housing) {
    conditions.add('colocation')
  }

  if (responses.works_from_home) {
    conditions.add('teletravail')
  }

  // ========================================
  // ENVIRONMENT - Environnement
  // ========================================
  const waterHardnessMapping: Record<string, string> = {
    'soft': 'eau_douce',
    'medium': 'eau_moyenne',
    'hard': 'eau_dure',
  }
  if (responses.water_hardness && waterHardnessMapping[responses.water_hardness]) {
    conditions.add(waterHardnessMapping[responses.water_hardness])
  }

  if (responses.high_dust_area) {
    conditions.add('zone_poussiere')
  }

  if (responses.high_pollen_area) {
    conditions.add('zone_pollen')
  }

  // Allergies
  const allergyMapping: Record<string, string> = {
    'dust': 'allergie_poussiere',
    'pollen': 'allergie_pollen',
    'mold': 'allergie_moisissures',
    'pets': 'allergie_animaux',
  }

  responses.allergies?.forEach(allergy => {
    const code = allergyMapping[allergy]
    if (code) conditions.add(code)
  })

  // Si allergie présente, ajouter condition globale
  const hasAllergy = responses.allergies?.filter(a => a !== 'none').length > 0
  if (hasAllergy) {
    conditions.add('allergies')
  }

  return conditions
}

/**
 * Vérifie si une tâche doit être assignée selon son condition_code
 * @param conditionCode Le code de condition de la tâche (peut être null pour tâches universelles)
 * @param activeConditions Set des conditions actives dérivées du questionnaire
 * @returns true si la tâche doit être assignée
 */
export function shouldAssignTask(
  conditionCode: string | null,
  activeConditions: Set<string>
): boolean {
  // Tâches universelles (pas de condition) : toujours assignées
  if (!conditionCode) {
    return true
  }

  // Conditions inversées (préfixe "pas_")
  if (conditionCode.startsWith('pas_')) {
    // Ex: "pas_robot_aspirateur" → assignée si l'utilisateur n'a PAS de robot aspirateur
    // Donc si activeConditions contient "pas_robot_aspirateur", on assigne
    return activeConditions.has(conditionCode)
  }

  // Conditions multiples séparées par "+"
  if (conditionCode.includes('+')) {
    const requiredConditions = conditionCode.split('+')
    return requiredConditions.every(c => activeConditions.has(c.trim()))
  }

  // Conditions alternatives séparées par "|"
  if (conditionCode.includes('|')) {
    const alternativeConditions = conditionCode.split('|')
    return alternativeConditions.some(c => activeConditions.has(c.trim()))
  }

  // Condition simple
  return activeConditions.has(conditionCode)
}

/**
 * Calcule un multiplicateur de points basé sur le profil utilisateur
 * Les tâches peuvent valoir plus ou moins de points selon le contexte
 */
export function calculatePointsMultiplier(
  responses: QuestionnaireResponses,
  taskDifficulty: number
): number {
  let multiplier = 1.0

  // Niveau d'exigence influence les points
  // Plus exigeant = plus de tâches mais moins de points par tâche (car plus facile)
  // Moins exigeant = moins de tâches mais plus de points par tâche (effort notable)
  const cleanlinessLevel = responses.cleanliness_level || 3
  if (cleanlinessLevel <= 2) {
    multiplier *= 1.2 // Bonus pour les personnes relax qui font l'effort
  } else if (cleanlinessLevel >= 4) {
    multiplier *= 0.9 // Légère réduction pour les très exigeants
  }

  // Allergies = bonus pour tâches difficiles (plus important de les faire)
  const hasAllergy = responses.allergies?.filter(a => a !== 'none').length > 0
  if (hasAllergy && taskDifficulty >= 3) {
    multiplier *= 1.1
  }

  // Enfants ou animaux = bonus pour effort supplémentaire
  if (responses.has_children || (responses.animals?.filter(a => a !== 'none').length || 0) > 0) {
    multiplier *= 1.05
  }

  return Math.round(multiplier * 100) / 100
}

/**
 * Ajuste la fréquence d'une tâche selon le profil utilisateur
 * Retourne un facteur multiplicateur pour days_default
 * < 1 = plus fréquent, > 1 = moins fréquent
 */
export function calculateFrequencyAdjustment(
  responses: QuestionnaireResponses,
  conditionCode: string | null
): number {
  let adjustment = 1.0

  // Niveau d'exigence
  const cleanlinessLevel = responses.cleanliness_level || 3

  // Très exigeant = tâches plus fréquentes
  if (cleanlinessLevel >= 5) {
    adjustment *= 0.7
  } else if (cleanlinessLevel >= 4) {
    adjustment *= 0.85
  } else if (cleanlinessLevel <= 2) {
    adjustment *= 1.3 // Moins fréquent pour les personnes relax
  } else if (cleanlinessLevel === 1) {
    adjustment *= 1.5
  }

  // Allergies = tâches de dépoussiérage plus fréquentes
  const hasAllergy = responses.allergies?.filter(a => a !== 'none').length > 0
  if (hasAllergy && conditionCode?.includes('poussiere')) {
    adjustment *= 0.8
  }

  // Eau dure = détartrage plus fréquent
  if (responses.water_hardness === 'hard' && conditionCode?.includes('detartrage')) {
    adjustment *= 0.7
  }

  // Animaux = nettoyage poils plus fréquent
  const hasAnimals = responses.animals?.filter(a => a !== 'none').length > 0
  if (hasAnimals && (conditionCode === 'chat' || conditionCode === 'chien')) {
    adjustment *= 0.9
  }

  // Zone poussiéreuse = dépoussiérage plus fréquent
  if (responses.high_dust_area) {
    adjustment *= 0.85
  }

  return Math.round(adjustment * 100) / 100
}

/**
 * Liste de toutes les conditions supportées pour référence
 */
export const ALL_CONDITION_CODES = [
  // Housing
  'maison', 'appartement', 'escaliers', 'cheminee', 'dressing', 'bureau',

  // Kitchen
  'grille_pain', 'robot_cuisine', 'robot_cuiseur', 'plancha_bbq', 'compost',
  'garde_manger', 'lave_vaisselle', 'four', 'micro_ondes', 'hotte', 'congelateur',
  'cuisine_frequente',

  // Bathroom
  'paroi_douche', 'rideau_douche', 'bidet', 'tapis_bain', 'baignoire',

  // Laundry
  'lave_linge', 'seche_linge', 'repassage', 'vetements_outdoor',

  // Furniture
  'meubles_bois', 'canape_cuir', 'canape_tissu', 'tapis', 'rideaux', 'stores',
  'sol_carrelage', 'sol_parquet', 'sol_moquette', 'sol_mixte',

  // Robots
  'robot_aspirateur', 'robot_laveur', 'robot_station_autovidage',
  'robot_vitres', 'robot_tondeuse', 'pas_robot_aspirateur',

  // Outdoor
  'exterieur', 'jardin', 'terrasse', 'balcon', 'pelouse', 'haies',
  'gouttiere', 'barbecue', 'piscine', 'jacuzzi', 'garage',
  'potager', 'mobilier_jardin', 'abri_jardin',

  // Animals
  'animaux', 'chat', 'chien', 'aquarium', 'rongeur_oiseau', 'reptile',

  // Children
  'enfants', 'bebe', 'enfants_exterieur',

  // Lifestyle
  'colocation', 'teletravail',

  // Environment
  'eau_douce', 'eau_moyenne', 'eau_dure',
  'zone_poussiere', 'zone_pollen',
  'allergies', 'allergie_poussiere', 'allergie_pollen',
  'allergie_moisissures', 'allergie_animaux',
] as const

export type ConditionCode = typeof ALL_CONDITION_CODES[number]
