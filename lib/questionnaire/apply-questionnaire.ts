/**
 * Service pour appliquer les réponses du questionnaire et créer les tâches automatiquement
 * Version 3.0 - Compatible avec 227 tâches et 97 conditions
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { QuestionnaireResponses } from './schema'
import {
  determineTaskAssignmentsFromDB,
  applyTaskAssignments,
  determineTaskAssignments,
  calculateTaskPoints,
} from './task-assignment'

export interface ApplyQuestionnaireResult {
  success: boolean
  tasksCreated: number
  tasksUpdated: number
  activeConditions?: string[]
  error?: string
}

/**
 * Sauvegarde les réponses du questionnaire et crée/met à jour les tâches du foyer
 * Version 3.0: Utilise condition_codes pour le filtrage
 */
export async function applyQuestionnaire(
  supabase: SupabaseClient,
  responses: QuestionnaireResponses,
  profileId: string
): Promise<ApplyQuestionnaireResult> {
  try {
    // 1. Sauvegarder les réponses du questionnaire dans profile_questionnaire
    const questionnaireData = {
      household_id: responses.household_id,
      profile_id: profileId,

      // HOUSING
      housing_type: responses.housing_type,
      room_count: responses.room_count,
      has_stairs: responses.has_stairs || false,
      has_fireplace: responses.has_fireplace || false,
      has_dressing: responses.has_dressing || false,
      has_office: responses.has_office || false,

      // KITCHEN
      kitchen_equipment: responses.kitchen_equipment || [],
      cooking_frequency: responses.cooking_frequency,

      // BATHROOM
      bathroom_count: responses.bathroom_count || 1,
      bathroom_features: responses.bathroom_features || [],

      // LAUNDRY
      has_washing_machine: responses.has_washing_machine ?? true,
      has_dryer: responses.has_dryer || false,
      laundry_features: responses.laundry_features || [],

      // FURNITURE
      furniture_types: responses.furniture_types || [],
      floor_type: responses.floor_type || 'tile',

      // ROBOTS
      robots: responses.robots || [],

      // OUTDOOR
      has_outdoor_space: responses.has_outdoor_space || false,
      outdoor_type: responses.outdoor_type || null,
      outdoor_features: responses.outdoor_features || [],

      // ANIMALS
      animals: responses.animals || [],

      // CHILDREN
      has_children: responses.has_children || false,
      has_baby: responses.has_baby || false,
      children_play_outside: responses.children_play_outside || false,

      // LIFESTYLE
      household_size: responses.household_size || 2,
      is_shared_housing: responses.is_shared_housing || false,
      works_from_home: responses.works_from_home || false,

      // ENVIRONMENT
      water_hardness: responses.water_hardness || 'medium',
      high_dust_area: responses.high_dust_area || false,
      high_pollen_area: responses.high_pollen_area || false,
      allergies: responses.allergies || [],

      // PREFERENCES
      cleanliness_level: responses.cleanliness_level || 3,
      available_minutes_daily: responses.available_minutes_daily || 45,
    }

    const { error: saveError } = await supabase
      .from('profile_questionnaire')
      .upsert(questionnaireData, { onConflict: 'household_id' })

    if (saveError) {
      console.error('Error saving questionnaire:', saveError)

      // Tenter avec l'ancienne table questionnaire_responses en fallback
      const fallbackData = {
        household_id: responses.household_id,
        profile_id: profileId,
        housing_type: responses.housing_type,
        room_count: responses.room_count,
        has_outdoor_space: responses.has_outdoor_space,
        outdoor_type: responses.outdoor_type || null,
        has_pets: (responses.animals?.length || 0) > 0,
        pet_types: responses.animals || [],
        household_size: responses.household_size,
        has_children: responses.has_children,
        cooking_frequency: responses.cooking_frequency,
        has_dishwasher: responses.kitchen_equipment?.includes('dishwasher') || false,
        has_washing_machine: responses.has_washing_machine ?? true,
        has_dryer: responses.has_dryer || false,
      }

      const { error: fallbackError } = await supabase
        .from('questionnaire_responses')
        .upsert(fallbackData, { onConflict: 'household_id' })

      if (fallbackError) {
        console.error('Fallback save also failed:', fallbackError)
        return {
          success: false,
          tasksCreated: 0,
          tasksUpdated: 0,
          error: `Primary: ${saveError.message}, Fallback: ${fallbackError.message}`,
        }
      }
    }

    // 2. Essayer d'abord avec la nouvelle logique basée sur condition_codes
    try {
      const result = await determineTaskAssignmentsFromDB(supabase, responses)

      if (result.assignedTasks > 0) {
        // Appliquer les assignations avec la nouvelle fonction
        const applyResult = await applyTaskAssignments(
          supabase,
          responses.household_id,
          result.assignments
        )

        if (applyResult.success) {
          return {
            success: true,
            tasksCreated: applyResult.count,
            tasksUpdated: 0,
            activeConditions: result.activeConditions,
          }
        }
      }
    } catch (err) {
      console.warn('New assignment logic failed, falling back to legacy:', err)
    }

    // 3. Fallback: utiliser l'ancienne logique basée sur les noms
    const assignments = determineTaskAssignments(responses)

    // 4. Récupérer tous les task_templates disponibles
    const { data: templates, error: templatesError } = await supabase
      .from('task_templates')
      .select('id, name, base_points, category_id, condition_code')

    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
      return {
        success: false,
        tasksCreated: 0,
        tasksUpdated: 0,
        error: templatesError.message,
      }
    }

    // 5. Récupérer les tâches existantes du foyer
    const { data: existingTasks, error: existingError } = await supabase
      .from('household_tasks')
      .select('id, template_id, is_active, custom_points')
      .eq('household_id', responses.household_id)

    if (existingError) {
      console.error('Error fetching existing tasks:', existingError)
      return {
        success: false,
        tasksCreated: 0,
        tasksUpdated: 0,
        error: existingError.message,
      }
    }

    const existingTasksByTemplateId = new Map(
      (existingTasks || []).map((t) => [t.template_id, t])
    )

    let tasksCreated = 0
    let tasksUpdated = 0

    // 6. Pour chaque assignation, créer ou mettre à jour la tâche
    for (const assignment of assignments) {
      // Trouver le template correspondant par nom
      const template = templates?.find((t) => t.name === assignment.templateName)
      if (!template) {
        // Ce n'est pas forcément une erreur - le template peut ne pas exister
        continue
      }

      const points = calculateTaskPoints(
        template.base_points,
        assignment.pointsMultiplier
      )

      const existingTask = existingTasksByTemplateId.get(template.id)

      if (existingTask) {
        // Mettre à jour la tâche existante
        const { error: updateError } = await supabase
          .from('household_tasks')
          .update({
            is_active: assignment.shouldAssign,
            custom_points: points,
          })
          .eq('id', existingTask.id)

        if (!updateError) {
          tasksUpdated++
        }
      } else if (assignment.shouldAssign) {
        // Créer une nouvelle tâche
        const { error: insertError } = await supabase
          .from('household_tasks')
          .insert({
            household_id: responses.household_id,
            template_id: template.id,
            is_active: true,
            custom_points: points,
          })

        if (!insertError) {
          tasksCreated++
        }
      }
    }

    return {
      success: true,
      tasksCreated,
      tasksUpdated,
    }
  } catch (error) {
    console.error('Unexpected error in applyQuestionnaire:', error)
    return {
      success: false,
      tasksCreated: 0,
      tasksUpdated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Réassigne les tâches d'un foyer existant sans modifier le questionnaire
 * Utile après une mise à jour des templates
 */
export async function reassignHouseholdTasks(
  supabase: SupabaseClient,
  householdId: string
): Promise<ApplyQuestionnaireResult> {
  try {
    // 1. Récupérer les réponses du questionnaire existantes
    const { data: questionnaire, error: fetchError } = await supabase
      .from('profile_questionnaire')
      .select('*')
      .eq('household_id', householdId)
      .single()

    if (fetchError || !questionnaire) {
      // Essayer l'ancienne table
      const { data: oldQuestionnaire, error: oldFetchError } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('household_id', householdId)
        .single()

      if (oldFetchError || !oldQuestionnaire) {
        return {
          success: false,
          tasksCreated: 0,
          tasksUpdated: 0,
          error: 'Questionnaire non trouvé pour ce foyer',
        }
      }

      // Convertir l'ancien format
      const responses: QuestionnaireResponses = {
        household_id: householdId,
        housing_type: oldQuestionnaire.housing_type || 'apartment',
        room_count: oldQuestionnaire.room_count || 3,
        has_stairs: false,
        has_fireplace: false,
        has_dressing: false,
        has_office: false,
        kitchen_equipment: oldQuestionnaire.has_dishwasher ? ['dishwasher'] : [],
        cooking_frequency: oldQuestionnaire.cooking_frequency || 'regular',
        bathroom_count: 1,
        bathroom_features: [],
        has_washing_machine: oldQuestionnaire.has_washing_machine ?? true,
        has_dryer: oldQuestionnaire.has_dryer || false,
        laundry_features: [],
        furniture_types: [],
        floor_type: 'tile',
        robots: [],
        has_outdoor_space: oldQuestionnaire.has_outdoor_space || false,
        outdoor_type: oldQuestionnaire.outdoor_type,
        outdoor_features: [],
        animals: oldQuestionnaire.pet_types || [],
        has_children: oldQuestionnaire.has_children || false,
        has_baby: false,
        children_play_outside: false,
        household_size: oldQuestionnaire.household_size || 2,
        is_shared_housing: false,
        works_from_home: false,
        water_hardness: 'medium',
        high_dust_area: false,
        high_pollen_area: false,
        allergies: [],
        cleanliness_level: 3,
        available_minutes_daily: 45,
      }

      // Utiliser la logique d'assignation
      const result = await determineTaskAssignmentsFromDB(supabase, responses)
      const applyResult = await applyTaskAssignments(
        supabase,
        householdId,
        result.assignments
      )

      return {
        success: applyResult.success,
        tasksCreated: applyResult.count,
        tasksUpdated: 0,
        activeConditions: result.activeConditions,
        error: applyResult.error,
      }
    }

    // 2. Convertir en QuestionnaireResponses
    const responses: QuestionnaireResponses = {
      household_id: householdId,
      housing_type: questionnaire.housing_type || 'apartment',
      room_count: questionnaire.room_count || 3,
      has_stairs: questionnaire.has_stairs || false,
      has_fireplace: questionnaire.has_fireplace || false,
      has_dressing: questionnaire.has_dressing || false,
      has_office: questionnaire.has_office || false,
      kitchen_equipment: questionnaire.kitchen_equipment || [],
      cooking_frequency: questionnaire.cooking_frequency || 'regular',
      bathroom_count: questionnaire.bathroom_count || 1,
      bathroom_features: questionnaire.bathroom_features || [],
      has_washing_machine: questionnaire.has_washing_machine ?? true,
      has_dryer: questionnaire.has_dryer || false,
      laundry_features: questionnaire.laundry_features || [],
      furniture_types: questionnaire.furniture_types || [],
      floor_type: questionnaire.floor_type || 'tile',
      robots: questionnaire.robots || [],
      has_outdoor_space: questionnaire.has_outdoor_space || false,
      outdoor_type: questionnaire.outdoor_type,
      outdoor_features: questionnaire.outdoor_features || [],
      animals: questionnaire.animals || [],
      has_children: questionnaire.has_children || false,
      has_baby: questionnaire.has_baby || false,
      children_play_outside: questionnaire.children_play_outside || false,
      household_size: questionnaire.household_size || 2,
      is_shared_housing: questionnaire.is_shared_housing || false,
      works_from_home: questionnaire.works_from_home || false,
      water_hardness: questionnaire.water_hardness || 'medium',
      high_dust_area: questionnaire.high_dust_area || false,
      high_pollen_area: questionnaire.high_pollen_area || false,
      allergies: questionnaire.allergies || [],
      cleanliness_level: questionnaire.cleanliness_level || 3,
      available_minutes_daily: questionnaire.available_minutes_daily || 45,
    }

    // 3. Réassigner les tâches
    const result = await determineTaskAssignmentsFromDB(supabase, responses)
    const applyResult = await applyTaskAssignments(
      supabase,
      householdId,
      result.assignments
    )

    return {
      success: applyResult.success,
      tasksCreated: applyResult.count,
      tasksUpdated: 0,
      activeConditions: result.activeConditions,
      error: applyResult.error,
    }
  } catch (error) {
    console.error('Error in reassignHouseholdTasks:', error)
    return {
      success: false,
      tasksCreated: 0,
      tasksUpdated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
