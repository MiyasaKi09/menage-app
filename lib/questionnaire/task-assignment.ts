/**
 * Logique d'assignation intelligente des tâches basée sur les réponses au questionnaire
 * Version 3.0 - Utilise les condition_codes pour filtrer 227 tâches
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { QuestionnaireResponses } from './schema'
import {
  deriveConditionCodes,
  shouldAssignTask,
  calculatePointsMultiplier,
  calculateFrequencyAdjustment,
} from './condition-mapping'

export interface TaskTemplate {
  id: string
  name: string
  duration_minutes: number
  difficulty: number
  base_points: number
  category_id: string
  frequency_id: string
  condition_code: string | null
  needs_product: boolean
  tip: string | null
  icon: string | null
}

export interface TaskAssignment {
  templateId: string
  templateName: string
  shouldAssign: boolean
  pointsMultiplier: number
  frequencyAdjustment: number
}

export interface AssignmentResult {
  assignments: TaskAssignment[]
  totalTasks: number
  assignedTasks: number
  activeConditions: string[]
  estimatedDailyMinutes: number
}

/**
 * Détermine quelles tâches doivent être assignées au foyer
 * basé sur les condition_codes des task_templates
 */
export async function determineTaskAssignmentsFromDB(
  supabase: SupabaseClient,
  responses: QuestionnaireResponses
): Promise<AssignmentResult> {
  // 1. Dériver toutes les conditions actives depuis le questionnaire
  const activeConditions = deriveConditionCodes(responses)

  // 2. Récupérer tous les templates de tâches
  const { data: templates, error } = await supabase
    .from('task_templates')
    .select(`
      id,
      name,
      duration_minutes,
      difficulty,
      base_points,
      category_id,
      frequency_id,
      condition_code,
      needs_product,
      tip,
      icon
    `)
    .order('category_id')

  if (error) {
    console.error('Erreur récupération task_templates:', error)
    throw new Error(`Impossible de récupérer les tâches: ${error.message}`)
  }

  if (!templates || templates.length === 0) {
    console.warn('Aucun template de tâche trouvé')
    return {
      assignments: [],
      totalTasks: 0,
      assignedTasks: 0,
      activeConditions: Array.from(activeConditions),
      estimatedDailyMinutes: 0,
    }
  }

  // 3. Filtrer et assigner les tâches selon les conditions
  const assignments: TaskAssignment[] = []
  let estimatedDailyMinutes = 0

  for (const template of templates) {
    const shouldAssign = shouldAssignTask(template.condition_code, activeConditions)
    const pointsMultiplier = shouldAssign
      ? calculatePointsMultiplier(responses, template.difficulty)
      : 1.0
    const frequencyAdjustment = shouldAssign
      ? calculateFrequencyAdjustment(responses, template.condition_code)
      : 1.0

    assignments.push({
      templateId: template.id,
      templateName: template.name,
      shouldAssign,
      pointsMultiplier,
      frequencyAdjustment,
    })

    // Estimer le temps quotidien (approximation basée sur fréquence)
    if (shouldAssign) {
      // Estimation grossière: on divise la durée par la fréquence moyenne
      estimatedDailyMinutes += template.duration_minutes / 7 // moyenne hebdo simplifiée
    }
  }

  const assignedCount = assignments.filter(a => a.shouldAssign).length

  return {
    assignments,
    totalTasks: templates.length,
    assignedTasks: assignedCount,
    activeConditions: Array.from(activeConditions),
    estimatedDailyMinutes: Math.round(estimatedDailyMinutes),
  }
}

/**
 * Version synchrone pour compatibilité avec l'ancienne API
 * Utilise des noms de tâches au lieu des IDs
 * @deprecated Utiliser determineTaskAssignmentsFromDB à la place
 */
export function determineTaskAssignments(
  responses: QuestionnaireResponses
): TaskAssignment[] {
  const activeConditions = deriveConditionCodes(responses)
  const assignments: TaskAssignment[] = []

  // Liste exhaustive des tâches avec leurs condition_codes
  // Ceci est une version simplifiée - la vraie logique utilise la DB
  const taskConditionMap: Array<{ name: string; conditionCode: string | null; difficulty: number }> = [
    // CUISINE - Tâches universelles
    { name: 'Faire la vaisselle', conditionCode: null, difficulty: 1 },
    { name: 'Nettoyer le plan de travail', conditionCode: null, difficulty: 1 },
    { name: 'Sortir les poubelles', conditionCode: null, difficulty: 1 },
    { name: 'Nettoyer l\'évier et robinetterie', conditionCode: null, difficulty: 2 },
    { name: 'Vider et nettoyer la poubelle', conditionCode: null, difficulty: 2 },
    { name: 'Nettoyer le réfrigérateur', conditionCode: null, difficulty: 3 },
    { name: 'Organiser les placards', conditionCode: null, difficulty: 2 },

    // CUISINE - Conditionnelles
    { name: 'Vider le lave-vaisselle', conditionCode: 'lave_vaisselle', difficulty: 1 },
    { name: 'Nettoyer le lave-vaisselle', conditionCode: 'lave_vaisselle', difficulty: 2 },
    { name: 'Nettoyer le four', conditionCode: 'four', difficulty: 3 },
    { name: 'Dégraisser la hotte', conditionCode: 'hotte', difficulty: 3 },
    { name: 'Nettoyer le micro-ondes', conditionCode: 'micro_ondes', difficulty: 2 },
    { name: 'Détartrer la cafetière/bouilloire', conditionCode: 'eau_dure|eau_moyenne', difficulty: 2 },
    { name: 'Nettoyer le grille-pain', conditionCode: 'grille_pain', difficulty: 1 },
    { name: 'Nettoyer robot de cuisine', conditionCode: 'robot_cuisine', difficulty: 2 },
    { name: 'Nettoyer robot cuiseur', conditionCode: 'robot_cuiseur', difficulty: 3 },
    { name: 'Nettoyer la plancha/BBQ', conditionCode: 'plancha_bbq', difficulty: 3 },
    { name: 'Vider le compost', conditionCode: 'compost', difficulty: 1 },
    { name: 'Ranger le garde-manger', conditionCode: 'garde_manger', difficulty: 2 },
    { name: 'Dégivrer le congélateur', conditionCode: 'congelateur', difficulty: 3 },

    // SALLE DE BAIN - Universelles
    { name: 'Nettoyer les toilettes', conditionCode: null, difficulty: 2 },
    { name: 'Nettoyer la salle de bain', conditionCode: null, difficulty: 3 },
    { name: 'Nettoyer la douche', conditionCode: null, difficulty: 2 },
    { name: 'Nettoyer les miroirs', conditionCode: null, difficulty: 1 },
    { name: 'Aérer la salle de bain', conditionCode: null, difficulty: 1 },

    // SALLE DE BAIN - Conditionnelles
    { name: 'Nettoyer paroi de douche', conditionCode: 'paroi_douche', difficulty: 2 },
    { name: 'Laver rideau de douche', conditionCode: 'rideau_douche', difficulty: 2 },
    { name: 'Nettoyer le bidet', conditionCode: 'bidet', difficulty: 2 },
    { name: 'Laver les tapis de bain', conditionCode: 'tapis_bain', difficulty: 1 },
    { name: 'Nettoyer la baignoire', conditionCode: 'baignoire', difficulty: 3 },
    { name: 'Détartrer les robinets', conditionCode: 'eau_dure|eau_moyenne', difficulty: 2 },

    // CHAMBRE - Universelles
    { name: 'Changer les draps', conditionCode: null, difficulty: 2 },
    { name: 'Aérer la chambre', conditionCode: null, difficulty: 1 },
    { name: 'Dépoussiérer les meubles', conditionCode: null, difficulty: 1 },
    { name: 'Passer l\'aspirateur chambre', conditionCode: 'pas_robot_aspirateur', difficulty: 2 },
    { name: 'Aspirer le matelas', conditionCode: 'allergies|allergie_poussiere', difficulty: 3 },
    { name: 'Retourner le matelas', conditionCode: null, difficulty: 3 },

    // SALON - Universelles
    { name: 'Ranger le salon', conditionCode: null, difficulty: 1 },
    { name: 'Aérer le salon', conditionCode: null, difficulty: 1 },
    { name: 'Dépoussiérer meubles salon', conditionCode: null, difficulty: 1 },
    { name: 'Passer l\'aspirateur salon', conditionCode: 'pas_robot_aspirateur', difficulty: 2 },

    // SALON - Conditionnelles
    { name: 'Nettoyer canapé cuir', conditionCode: 'canape_cuir', difficulty: 2 },
    { name: 'Nettoyer canapé tissu', conditionCode: 'canape_tissu', difficulty: 2 },
    { name: 'Aspirer les tapis', conditionCode: 'tapis', difficulty: 2 },
    { name: 'Laver les rideaux', conditionCode: 'rideaux', difficulty: 3 },
    { name: 'Nettoyer les stores', conditionCode: 'stores', difficulty: 2 },
    { name: 'Cirer meubles en bois', conditionCode: 'meubles_bois', difficulty: 2 },

    // BUANDERIE
    { name: 'Faire une machine de linge', conditionCode: 'lave_linge', difficulty: 1 },
    { name: 'Plier et ranger le linge', conditionCode: 'lave_linge', difficulty: 1 },
    { name: 'Nettoyer le lave-linge', conditionCode: 'lave_linge', difficulty: 2 },
    { name: 'Nettoyer le sèche-linge', conditionCode: 'seche_linge', difficulty: 2 },
    { name: 'Repasser le linge', conditionCode: 'repassage', difficulty: 2 },
    { name: 'Entretenir vêtements outdoor', conditionCode: 'vetements_outdoor', difficulty: 3 },

    // ENTRÉE - Universelles
    { name: 'Nettoyer le paillasson', conditionCode: null, difficulty: 1 },
    { name: 'Ranger les chaussures', conditionCode: null, difficulty: 1 },
    { name: 'Laver sols entrée', conditionCode: null, difficulty: 2 },

    // GÉNÉRAL - Universelles
    { name: 'Aérer toutes les pièces', conditionCode: null, difficulty: 1 },
    { name: 'Nettoyer les vitres', conditionCode: null, difficulty: 3 },
    { name: 'Passer la serpillière', conditionCode: 'sol_carrelage|sol_mixte', difficulty: 2 },
    { name: 'Faire les courses', conditionCode: null, difficulty: 2 },

    // EXTÉRIEUR - Conditionnelles
    { name: 'Arroser les plantes', conditionCode: 'exterieur', difficulty: 1 },
    { name: 'Tondre la pelouse', conditionCode: 'pelouse', difficulty: 3 },
    { name: 'Tailler les haies', conditionCode: 'haies', difficulty: 3 },
    { name: 'Nettoyer le barbecue', conditionCode: 'barbecue', difficulty: 2 },
    { name: 'Entretenir la piscine', conditionCode: 'piscine', difficulty: 3 },
    { name: 'Nettoyer le jacuzzi', conditionCode: 'jacuzzi', difficulty: 3 },
    { name: 'Nettoyer le garage', conditionCode: 'garage', difficulty: 3 },
    { name: 'Entretenir le potager', conditionCode: 'potager', difficulty: 2 },
    { name: 'Nettoyer mobilier jardin', conditionCode: 'mobilier_jardin', difficulty: 2 },
    { name: 'Ranger l\'abri de jardin', conditionCode: 'abri_jardin', difficulty: 2 },
    { name: 'Nettoyer les gouttières', conditionCode: 'gouttiere', difficulty: 4 },

    // ROBOTS
    { name: 'Vider bac robot aspirateur', conditionCode: 'robot_aspirateur', difficulty: 1 },
    { name: 'Nettoyer brosses robot', conditionCode: 'robot_aspirateur', difficulty: 2 },
    { name: 'Vider station auto-vidage', conditionCode: 'robot_station_autovidage', difficulty: 1 },
    { name: 'Entretenir robot laveur', conditionCode: 'robot_laveur', difficulty: 2 },
    { name: 'Nettoyer robot vitres', conditionCode: 'robot_vitres', difficulty: 2 },
    { name: 'Entretenir robot tondeuse', conditionCode: 'robot_tondeuse', difficulty: 2 },

    // ANIMAUX
    { name: 'Changer la litière', conditionCode: 'chat', difficulty: 2 },
    { name: 'Nettoyer bac à litière', conditionCode: 'chat', difficulty: 2 },
    { name: 'Laver gamelles animaux', conditionCode: 'animaux', difficulty: 1 },
    { name: 'Aspirer poils animaux', conditionCode: 'chat|chien', difficulty: 2 },
    { name: 'Laver panier animal', conditionCode: 'chat|chien', difficulty: 2 },
    { name: 'Brosser l\'animal', conditionCode: 'chat|chien', difficulty: 1 },
    { name: 'Nettoyer l\'aquarium', conditionCode: 'aquarium', difficulty: 3 },
    { name: 'Nettoyer la cage', conditionCode: 'rongeur_oiseau', difficulty: 2 },
    { name: 'Nettoyer le terrarium', conditionCode: 'reptile', difficulty: 2 },

    // ENFANTS
    { name: 'Ranger les jouets', conditionCode: 'enfants', difficulty: 1 },
    { name: 'Nettoyer les jouets', conditionCode: 'enfants', difficulty: 2 },
    { name: 'Laver les peluches', conditionCode: 'enfants', difficulty: 2 },
    { name: 'Stériliser biberons', conditionCode: 'bebe', difficulty: 2 },
    { name: 'Nettoyer chaise haute', conditionCode: 'bebe', difficulty: 1 },
    { name: 'Désinfecter table à langer', conditionCode: 'bebe', difficulty: 1 },
    { name: 'Nettoyer jouets extérieur', conditionCode: 'enfants_exterieur', difficulty: 2 },

    // BUREAU
    { name: 'Ranger le bureau', conditionCode: 'bureau', difficulty: 1 },
    { name: 'Nettoyer écran ordinateur', conditionCode: 'bureau', difficulty: 1 },
    { name: 'Nettoyer clavier et souris', conditionCode: 'bureau', difficulty: 1 },
    { name: 'Organiser les câbles', conditionCode: 'bureau', difficulty: 2 },
    { name: 'Trier les documents', conditionCode: 'bureau', difficulty: 2 },

    // COLOCATION
    { name: 'Nettoyer espaces communs', conditionCode: 'colocation', difficulty: 2 },
    { name: 'Organiser frigo partagé', conditionCode: 'colocation', difficulty: 2 },
    { name: 'Vérifier produits communs', conditionCode: 'colocation', difficulty: 1 },

    // DRESSING
    { name: 'Organiser le dressing', conditionCode: 'dressing', difficulty: 2 },
    { name: 'Dépoussiérer le dressing', conditionCode: 'dressing', difficulty: 1 },

    // CHEMINÉE
    { name: 'Nettoyer la vitre cheminée', conditionCode: 'cheminee', difficulty: 2 },
    { name: 'Vider les cendres', conditionCode: 'cheminee', difficulty: 2 },
    { name: 'Ramonage cheminée', conditionCode: 'cheminee', difficulty: 4 },

    // ESCALIERS
    { name: 'Aspirer les escaliers', conditionCode: 'escaliers', difficulty: 2 },
    { name: 'Nettoyer rampe escalier', conditionCode: 'escaliers', difficulty: 1 },
  ]

  // Filtrer selon les conditions actives
  for (const task of taskConditionMap) {
    const shouldAssign = shouldAssignTask(task.conditionCode, activeConditions)
    const pointsMultiplier = shouldAssign
      ? calculatePointsMultiplier(responses, task.difficulty)
      : 1.0
    const frequencyAdjustment = shouldAssign
      ? calculateFrequencyAdjustment(responses, task.conditionCode)
      : 1.0

    assignments.push({
      templateId: '', // Non utilisé dans cette version
      templateName: task.name,
      shouldAssign,
      pointsMultiplier,
      frequencyAdjustment,
    })
  }

  return assignments
}

/**
 * Applique les assignations de tâches au foyer dans la base de données
 */
export async function applyTaskAssignments(
  supabase: SupabaseClient,
  householdId: string,
  assignments: TaskAssignment[]
): Promise<{ success: boolean; error?: string; count: number }> {
  const tasksToInsert = assignments
    .filter(a => a.shouldAssign)
    .map(a => ({
      household_id: householdId,
      template_id: a.templateId,
      is_active: true,
      custom_points: null, // Utilise les points de base du template
      // Les points seront calculés dynamiquement avec le multiplicateur
    }))

  if (tasksToInsert.length === 0) {
    return { success: true, count: 0 }
  }

  // Supprimer les anciennes assignations
  const { error: deleteError } = await supabase
    .from('household_tasks')
    .delete()
    .eq('household_id', householdId)

  if (deleteError) {
    console.error('Erreur suppression anciennes tâches:', deleteError)
    return { success: false, error: deleteError.message, count: 0 }
  }

  // Insérer les nouvelles assignations
  const { error: insertError } = await supabase
    .from('household_tasks')
    .insert(tasksToInsert)

  if (insertError) {
    console.error('Erreur insertion nouvelles tâches:', insertError)
    return { success: false, error: insertError.message, count: 0 }
  }

  return { success: true, count: tasksToInsert.length }
}

/**
 * Calcule les points pour une tâche en fonction de la réponse et du multiplicateur
 */
export function calculateTaskPoints(
  basePoints: number,
  multiplier: number
): number {
  return Math.round(basePoints * multiplier)
}

/**
 * Retourne un résumé des assignations par catégorie
 */
export function summarizeAssignments(
  assignments: TaskAssignment[]
): Record<string, { total: number; assigned: number }> {
  // Cette fonction nécessiterait les infos de catégorie
  // Pour l'instant, retourne un résumé simplifié
  const assigned = assignments.filter(a => a.shouldAssign).length
  const total = assignments.length

  return {
    'Toutes catégories': { total, assigned },
  }
}
