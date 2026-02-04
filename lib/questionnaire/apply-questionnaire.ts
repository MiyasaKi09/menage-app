/**
 * Service pour appliquer les réponses du questionnaire et créer les tâches automatiquement
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { QuestionnaireResponses } from './schema'
import {
  determineTaskAssignments,
  calculateTaskPoints,
} from './task-assignment'

export interface ApplyQuestionnaireResult {
  success: boolean
  tasksCreated: number
  tasksUpdated: number
  error?: string
}

/**
 * Sauvegarde les réponses du questionnaire et crée/met à jour les tâches du foyer
 */
export async function applyQuestionnaire(
  supabase: SupabaseClient,
  responses: QuestionnaireResponses,
  profileId: string
): Promise<ApplyQuestionnaireResult> {
  try {
    // 1. Sauvegarder les réponses du questionnaire
    const { error: saveError } = await supabase
      .from('questionnaire_responses')
      .upsert(
        {
          household_id: responses.household_id,
          profile_id: profileId,
          housing_type: responses.housing_type,
          room_count: responses.room_count,
          has_outdoor_space: responses.has_outdoor_space,
          outdoor_type: responses.outdoor_type || null,
          has_pets: responses.has_pets,
          pet_types: responses.pet_types || [],
          household_size: responses.household_size,
          has_children: responses.has_children,
          cooking_frequency: responses.cooking_frequency,
          has_dishwasher: responses.has_dishwasher,
          has_washing_machine: responses.has_washing_machine,
          has_dryer: responses.has_dryer,
        },
        { onConflict: 'household_id' }
      )

    if (saveError) {
      console.error('Error saving questionnaire:', saveError)
      return {
        success: false,
        tasksCreated: 0,
        tasksUpdated: 0,
        error: saveError.message,
      }
    }

    // 2. Déterminer quelles tâches doivent être assignées
    const assignments = determineTaskAssignments(responses)

    // 3. Récupérer tous les task_templates disponibles
    const { data: templates, error: templatesError } = await supabase
      .from('task_templates')
      .select('id, name, base_points, category_id')

    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
      return {
        success: false,
        tasksCreated: 0,
        tasksUpdated: 0,
        error: templatesError.message,
      }
    }

    // 4. Récupérer les tâches existantes du foyer
    const { data: existingTasks, error: existingError } = await supabase
      .from('household_tasks')
      .select('id, task_template_id, is_active, points_value')
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
      (existingTasks || []).map((t) => [t.task_template_id, t])
    )

    let tasksCreated = 0
    let tasksUpdated = 0

    // 5. Pour chaque assignation, créer ou mettre à jour la tâche
    for (const assignment of assignments) {
      // Trouver le template correspondant
      const template = templates?.find((t) => t.name === assignment.templateName)
      if (!template) {
        console.warn(`Template not found for: ${assignment.templateName}`)
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
            points_value: points,
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
            task_template_id: template.id,
            is_active: true,
            points_value: points,
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
