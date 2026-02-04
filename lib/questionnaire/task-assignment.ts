/**
 * Logique d'assignation intelligente des tâches basée sur les réponses au questionnaire
 */

import { QuestionnaireResponses } from './schema'

export interface TaskAssignment {
  templateName: string
  shouldAssign: boolean
  pointsMultiplier: number // Multiplicateur de points basé sur la complexité du foyer
}

/**
 * Détermine quelles tâches doivent être assignées au foyer
 */
export function determineTaskAssignments(
  responses: QuestionnaireResponses
): TaskAssignment[] {
  const assignments: TaskAssignment[] = []

  // Calculer le multiplicateur de base selon la taille du foyer
  const baseMultiplier = Math.min(1 + (responses.household_size - 1) * 0.1, 1.5)

  // ====== CUISINE & VAISSELLE ======
  if (responses.cooking_frequency !== 'never') {
    // Faire la vaisselle - fréquence dépend de la cuisine
    const dishwashingMultiplier =
      responses.cooking_frequency === 'daily' ? baseMultiplier * 1.2 : baseMultiplier

    assignments.push({
      templateName: 'Faire la vaisselle',
      shouldAssign: true,
      pointsMultiplier: dishwashingMultiplier,
    })

    // Nettoyer le plan de travail
    assignments.push({
      templateName: 'Nettoyer le plan de travail',
      shouldAssign: true,
      pointsMultiplier: baseMultiplier,
    })

    // Nettoyer la plaque de cuisson
    assignments.push({
      templateName: 'Nettoyer la plaque de cuisson',
      shouldAssign: true,
      pointsMultiplier: baseMultiplier,
    })

    // Nettoyer le four (si cuisine régulière)
    if (
      responses.cooking_frequency === 'regular' ||
      responses.cooking_frequency === 'daily'
    ) {
      assignments.push({
        templateName: 'Nettoyer le four',
        shouldAssign: true,
        pointsMultiplier: baseMultiplier * 1.3,
      })
    }

    // Vider le lave-vaisselle (si équipé)
    if (responses.has_dishwasher) {
      assignments.push({
        templateName: 'Vider le lave-vaisselle',
        shouldAssign: true,
        pointsMultiplier: baseMultiplier * 0.8,
      })
    }
  }

  // Vider les poubelles - toujours pertinent
  assignments.push({
    templateName: 'Sortir les poubelles',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier,
  })

  // Nettoyer le réfrigérateur
  assignments.push({
    templateName: 'Nettoyer le réfrigérateur',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * 1.2,
  })

  // ====== SANITAIRE ======
  // Toujours pertinent
  assignments.push({
    templateName: 'Nettoyer les toilettes',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier,
  })

  assignments.push({
    templateName: 'Nettoyer la salle de bain',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * 1.1,
  })

  assignments.push({
    templateName: 'Nettoyer la douche',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier,
  })

  assignments.push({
    templateName: 'Nettoyer les miroirs',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * 0.7,
  })

  // ====== TEXTILE ======
  if (responses.has_washing_machine) {
    assignments.push({
      templateName: 'Faire une machine de linge',
      shouldAssign: true,
      pointsMultiplier: baseMultiplier,
    })

    assignments.push({
      templateName: 'Étendre le linge',
      shouldAssign: !responses.has_dryer, // Seulement si pas de sèche-linge
      pointsMultiplier: baseMultiplier * 0.8,
    })
  }

  assignments.push({
    templateName: 'Plier et ranger le linge',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier,
  })

  assignments.push({
    templateName: 'Repasser le linge',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * 1.2,
  })

  assignments.push({
    templateName: 'Changer les draps',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * responses.room_count * 0.5,
  })

  // ====== SALON & ESPACES COMMUNS ======
  assignments.push({
    templateName: 'Passer l\'aspirateur',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * Math.sqrt(responses.room_count),
  })

  // Plus d'animaux = plus de poils = plus de ménage
  if (responses.has_pets) {
    assignments.push({
      templateName: 'Enlever les poils d\'animaux',
      shouldAssign: true,
      pointsMultiplier: baseMultiplier * 1.3,
    })
  }

  assignments.push({
    templateName: 'Dépoussiérer les meubles',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * Math.sqrt(responses.room_count),
  })

  assignments.push({
    templateName: 'Aérer les pièces',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * 0.5,
  })

  // Si enfants, tâches supplémentaires
  if (responses.has_children) {
    assignments.push({
      templateName: 'Ranger les jouets',
      shouldAssign: true,
      pointsMultiplier: baseMultiplier * 1.1,
    })
  }

  // ====== EXTÉRIEUR & PLANTES ======
  if (responses.has_outdoor_space) {
    if (responses.outdoor_type === 'garden') {
      assignments.push({
        templateName: 'Tondre la pelouse',
        shouldAssign: true,
        pointsMultiplier: baseMultiplier * 1.5,
      })

      assignments.push({
        templateName: 'Désherber',
        shouldAssign: true,
        pointsMultiplier: baseMultiplier * 1.3,
      })
    }

    if (
      responses.outdoor_type === 'balcony' ||
      responses.outdoor_type === 'terrace' ||
      responses.outdoor_type === 'garden'
    ) {
      assignments.push({
        templateName: 'Arroser les plantes',
        shouldAssign: true,
        pointsMultiplier: baseMultiplier * 0.7,
      })

      assignments.push({
        templateName: 'Nettoyer le balcon/terrasse',
        shouldAssign: true,
        pointsMultiplier: baseMultiplier,
      })
    }
  }

  // ====== SOLS & SURFACES ======
  assignments.push({
    templateName: 'Passer la serpillière',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * Math.sqrt(responses.room_count),
  })

  assignments.push({
    templateName: 'Nettoyer les vitres',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * Math.sqrt(responses.room_count),
  })

  // ====== RANGEMENT ======
  assignments.push({
    templateName: 'Ranger le salon',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier,
  })

  assignments.push({
    templateName: 'Ranger la cuisine',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier,
  })

  assignments.push({
    templateName: 'Ranger la chambre',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * responses.room_count * 0.6,
  })

  // ====== COURSES & GESTION ======
  assignments.push({
    templateName: 'Faire les courses',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * 1.2,
  })

  assignments.push({
    templateName: 'Planifier les repas',
    shouldAssign: responses.cooking_frequency !== 'never',
    pointsMultiplier: baseMultiplier,
  })

  assignments.push({
    templateName: 'Vérifier les dates de péremption',
    shouldAssign: true,
    pointsMultiplier: baseMultiplier * 0.6,
  })

  return assignments
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
