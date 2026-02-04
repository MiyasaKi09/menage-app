/**
 * Logique d'assignation intelligente des tâches basée sur les réponses au questionnaire
 * Version 2.0 - Expansion massive avec ~145 tâches
 */

import { QuestionnaireResponses } from './schema'

export interface TaskAssignment {
  templateName: string
  shouldAssign: boolean
  pointsMultiplier: number // Multiplicateur de points basé sur la complexité du foyer
}

/**
 * Détermine quelles tâches doivent être assignées au foyer
 * Utilise TOUS les champs du questionnaire enrichi pour une assignation intelligente
 */
export function determineTaskAssignments(
  responses: QuestionnaireResponses
): TaskAssignment[] {
  const assignments: TaskAssignment[] = []

  // ====== CALCULS DES MULTIPLICATEURS ======

  // Multiplicateur de base selon la taille du foyer
  const baseMultiplier = Math.min(1 + (responses.household_size - 1) * 0.1, 1.5)

  // Multiplicateur selon le niveau d'exigence de propreté (1-5)
  const cleanlinessLevel = responses.cleanliness_level || 3
  const cleanlinessMultiplier = 0.6 + (cleanlinessLevel - 1) * 0.15 // 0.6 à 1.2

  // Multiplicateur combiné
  const multiplier = baseMultiplier * cleanlinessMultiplier

  // Facteur de dureté de l'eau pour tâches de détartrage
  const waterHardness = responses.water_hardness || 'medium'
  const descalingMultiplier = waterHardness === 'hard' ? 1.3 : waterHardness === 'medium' ? 1.1 : 0.8

  // Nombre de salles de bain
  const bathroomCount = responses.bathroom_count || 1

  // Facteur d'allergies (augmente fréquence des tâches anti-poussière)
  const hasAllergies = responses.allergies && responses.allergies.length > 0 && !responses.allergies.includes('none')
  const allergyMultiplier = hasAllergies ? 1.2 : 1.0

  // ====== CUISINE (25 tâches) ======
  if (responses.cooking_frequency !== 'never') {
    const cookingMultiplier = responses.cooking_frequency === 'daily' ? 1.2 :
                              responses.cooking_frequency === 'regular' ? 1.0 : 0.8

    // Quotidiennes
    assignments.push(
      { templateName: 'Faire la vaisselle', shouldAssign: true, pointsMultiplier: multiplier * cookingMultiplier },
      { templateName: 'Nettoyer le plan de travail', shouldAssign: true, pointsMultiplier: multiplier * cookingMultiplier },
      { templateName: 'Sortir les poubelles', shouldAssign: true, pointsMultiplier: multiplier }
    )

    if (responses.has_dishwasher) {
      assignments.push({ templateName: 'Vider le lave-vaisselle', shouldAssign: true, pointsMultiplier: multiplier * 0.8 })
    }

    // Hebdomadaires
    assignments.push(
      { templateName: 'Nettoyer la plaque de cuisson', shouldAssign: true, pointsMultiplier: multiplier * cookingMultiplier },
      { templateName: 'Nettoyer l\'évier et robinetterie', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Vider et nettoyer la poubelle', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Nettoyer le micro-ondes', shouldAssign: true, pointsMultiplier: multiplier * cookingMultiplier }
    )

    // Mensuelles
    if (responses.cooking_frequency === 'regular' || responses.cooking_frequency === 'daily') {
      assignments.push(
        { templateName: 'Nettoyer le four', shouldAssign: true, pointsMultiplier: multiplier * 1.3 },
        { templateName: 'Nettoyer les grilles du four', shouldAssign: true, pointsMultiplier: multiplier * 1.2 },
        { templateName: 'Dégraisser la hotte', shouldAssign: true, pointsMultiplier: multiplier * 1.2 }
      )
    }

    assignments.push(
      { templateName: 'Nettoyer le réfrigérateur', shouldAssign: true, pointsMultiplier: multiplier * 1.1 },
      { templateName: 'Nettoyer les joints du réfrigérateur', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Organiser les placards', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Nettoyer les poignées de placards', shouldAssign: true, pointsMultiplier: multiplier * 0.9 },
      { templateName: 'Nettoyer plan de travail - profond', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier }
    )

    // Détartrage si eau dure
    if (responses.has_dishwasher) {
      assignments.push({ templateName: 'Nettoyer le lave-vaisselle', shouldAssign: true, pointsMultiplier: multiplier })
    }

    assignments.push(
      { templateName: 'Détartrer la cafetière/bouilloire', shouldAssign: true, pointsMultiplier: multiplier * descalingMultiplier },
      { templateName: 'Détartrer l\'évier', shouldAssign: waterHardness !== 'soft', pointsMultiplier: multiplier * descalingMultiplier }
    )

    // VMC si équipé
    if (responses.has_ventilation) {
      assignments.push({ templateName: 'Nettoyer les bouches de VMC', shouldAssign: true, pointsMultiplier: multiplier })
    }

    // Trimestrielles
    assignments.push(
      { templateName: 'Dégivrer le congélateur', shouldAssign: true, pointsMultiplier: multiplier * 1.2 },
      { templateName: 'Nettoyer derrière les électroménagers', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier * 1.3 }
    )
  } else {
    // Même sans cuisiner, certaines tâches restent pertinentes
    assignments.push(
      { templateName: 'Sortir les poubelles', shouldAssign: true, pointsMultiplier: multiplier * 0.7 },
      { templateName: 'Nettoyer le réfrigérateur', shouldAssign: true, pointsMultiplier: multiplier }
    )
  }

  // ====== SALLE DE BAIN (18 tâches × bathroom_count) ======
  const bathroomMultiplier = Math.min(bathroomCount * 0.8, 2.0) // Cap à 2x pour éviter surcharge

  // Quotidiennes
  assignments.push({ templateName: 'Aérer la salle de bain', shouldAssign: true, pointsMultiplier: multiplier * 0.5 })

  // Hebdomadaires
  assignments.push(
    { templateName: 'Nettoyer les toilettes', shouldAssign: true, pointsMultiplier: multiplier * bathroomMultiplier },
    { templateName: 'Nettoyer la salle de bain', shouldAssign: true, pointsMultiplier: multiplier * bathroomMultiplier * 1.1 },
    { templateName: 'Nettoyer la douche', shouldAssign: true, pointsMultiplier: multiplier * bathroomMultiplier },
    { templateName: 'Nettoyer les miroirs', shouldAssign: true, pointsMultiplier: multiplier * bathroomMultiplier * 0.7 },
    { templateName: 'Nettoyer le meuble de salle de bain', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Laver les tapis de bain', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Désinfecter poignées et interrupteurs', shouldAssign: cleanlinessLevel >= 4, pointsMultiplier: multiplier }
  )

  // Mensuelles
  assignments.push(
    { templateName: 'Nettoyer les joints de carrelage', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier * 1.2 },
    { templateName: 'Détartrer les robinets', shouldAssign: waterHardness !== 'soft', pointsMultiplier: multiplier * descalingMultiplier },
    { templateName: 'Nettoyer le rideau de douche', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Nettoyer les canalisations', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Nettoyer le pommeau de douche', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Organiser les produits', shouldAssign: true, pointsMultiplier: multiplier * 0.8 },
    { templateName: 'Détartrer baignoire/douche', shouldAssign: waterHardness !== 'soft', pointsMultiplier: multiplier * descalingMultiplier },
    { templateName: 'Nettoyer sèche-serviettes/radiateur', shouldAssign: true, pointsMultiplier: multiplier }
  )

  // VMC salle de bain
  if (responses.has_ventilation) {
    assignments.push({ templateName: 'Nettoyer la VMC/extracteur', shouldAssign: true, pointsMultiplier: multiplier })
  }

  // Trimestrielles
  assignments.push({ templateName: 'Nettoyer baignoire en profondeur', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier })

  // ====== CHAMBRE (15 tâches) ======
  const roomMultiplier = Math.sqrt(responses.room_count)

  // Quotidiennes
  assignments.push({ templateName: 'Aérer la chambre', shouldAssign: true, pointsMultiplier: multiplier * 0.5 })

  // Hebdomadaires
  assignments.push(
    { templateName: 'Changer les draps', shouldAssign: true, pointsMultiplier: multiplier * roomMultiplier },
    { templateName: 'Nettoyer miroirs de placard', shouldAssign: true, pointsMultiplier: multiplier * 0.8 },
    { templateName: 'Dépoussiérer les étagères', shouldAssign: true, pointsMultiplier: multiplier * allergyMultiplier }
  )

  // Mensuelles
  assignments.push(
    { templateName: 'Passer l\'aspirateur sous le lit', shouldAssign: cleanlinessLevel >= 3 || hasAllergies, pointsMultiplier: multiplier * allergyMultiplier },
    { templateName: 'Dépoussiérer les plinthes', shouldAssign: cleanlinessLevel >= 3 || hasAllergies, pointsMultiplier: multiplier * allergyMultiplier },
    { templateName: 'Nettoyer interrupteurs/prises', shouldAssign: cleanlinessLevel >= 4, pointsMultiplier: multiplier },
    { templateName: 'Aspirer le matelas', shouldAssign: cleanlinessLevel >= 3 || hasAllergies, pointsMultiplier: multiplier * allergyMultiplier * 1.2 },
    { templateName: 'Nettoyer lampes de chevet', shouldAssign: true, pointsMultiplier: multiplier * 0.8 },
    { templateName: 'Ranger tiroirs/placards', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Trier les vêtements', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Nettoyer volets/stores', shouldAssign: true, pointsMultiplier: multiplier }
  )

  // Trimestrielles
  assignments.push(
    { templateName: 'Retourner le matelas', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Laver les oreillers', shouldAssign: cleanlinessLevel >= 3 || hasAllergies, pointsMultiplier: multiplier },
    { templateName: 'Laver couvertures/couettes', shouldAssign: cleanlinessLevel >= 3 || hasAllergies, pointsMultiplier: multiplier }
  )

  // ====== SALON (8 tâches) ======
  const floorType = responses.floor_type || 'mixed'
  const hasRobotVacuum = responses.has_robot_vacuum || false

  // Aspirateur - ajusté si robot aspirateur
  const vacuumMultiplier = hasRobotVacuum ? 0.5 : 1.0

  assignments.push(
    { templateName: 'Passer l\'aspirateur - salon', shouldAssign: true, pointsMultiplier: multiplier * roomMultiplier * vacuumMultiplier },
    { templateName: 'Dépoussiérer les meubles - salon', shouldAssign: true, pointsMultiplier: multiplier * allergyMultiplier },
    { templateName: 'Ranger le salon', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Aérer le salon', shouldAssign: true, pointsMultiplier: multiplier * 0.5 }
  )

  // Mensuelles
  assignments.push(
    { templateName: 'Nettoyer le canapé', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier },
    { templateName: 'Nettoyer les coussins', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier * 0.9 }
  )

  // ====== BUANDERIE (5 tâches) ======
  if (responses.has_washing_machine) {
    const washingFrequency = responses.household_size >= 3 ? 1.2 : 1.0

    assignments.push(
      { templateName: 'Faire une machine de linge', shouldAssign: true, pointsMultiplier: multiplier * washingFrequency },
      { templateName: 'Plier et ranger le linge', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Nettoyer le lave-linge', shouldAssign: true, pointsMultiplier: multiplier }
    )

    if (!responses.has_dryer) {
      assignments.push({ templateName: 'Étendre le linge', shouldAssign: true, pointsMultiplier: multiplier })
    }

    if (cleanlinessLevel >= 4) {
      assignments.push({ templateName: 'Repasser le linge', shouldAssign: true, pointsMultiplier: multiplier })
    }
  }

  // ====== ENTRÉE (12 tâches) ======
  assignments.push(
    // Hebdomadaires
    { templateName: 'Nettoyer le paillasson', shouldAssign: true, pointsMultiplier: multiplier * 0.7 },
    { templateName: 'Laver les sols de l\'entrée', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Ranger les chaussures', shouldAssign: true, pointsMultiplier: multiplier * 0.8 },
    { templateName: 'Aspirer le couloir', shouldAssign: true, pointsMultiplier: multiplier * vacuumMultiplier },
    { templateName: 'Nettoyer poignée de porte', shouldAssign: cleanlinessLevel >= 4, pointsMultiplier: multiplier },
    { templateName: 'Organiser accessoires', shouldAssign: true, pointsMultiplier: multiplier * 0.7 },
    { templateName: 'Trier et jeter le courrier', shouldAssign: true, pointsMultiplier: multiplier * 0.7 },

    // Mensuelles
    { templateName: 'Nettoyer les chaussures', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier },
    { templateName: 'Dépoussiérer porte-manteau', shouldAssign: true, pointsMultiplier: multiplier * 0.7 },
    { templateName: 'Nettoyer la porte d\'entrée', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Nettoyer les interrupteurs', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier * 0.6 },
    { templateName: 'Nettoyer les plinthes', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier * allergyMultiplier }
  )

  // ====== EXTÉRIEUR (4 tâches) ======
  if (responses.has_outdoor_space) {
    if (responses.outdoor_type === 'garden') {
      assignments.push(
        { templateName: 'Tondre la pelouse', shouldAssign: true, pointsMultiplier: multiplier * 1.5 },
        { templateName: 'Désherber', shouldAssign: true, pointsMultiplier: multiplier * 1.3 }
      )
    }

    if (responses.outdoor_type === 'balcony' || responses.outdoor_type === 'terrace' || responses.outdoor_type === 'garden') {
      assignments.push(
        { templateName: 'Arroser les plantes', shouldAssign: true, pointsMultiplier: multiplier * 0.7 },
        { templateName: 'Nettoyer balcon/terrasse', shouldAssign: true, pointsMultiplier: multiplier }
      )
    }
  }

  // ====== GÉNÉRAL (20 tâches) ======
  // Quotidiennes
  assignments.push({ templateName: 'Aérer toutes les pièces', shouldAssign: true, pointsMultiplier: multiplier * 0.6 })

  // Hebdomadaires
  assignments.push(
    { templateName: 'Passer la serpillière', shouldAssign: floorType !== 'carpet', pointsMultiplier: multiplier * roomMultiplier },
    { templateName: 'Nettoyer poignées de porte', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier * 0.8 },
    { templateName: 'Trier et recycler', shouldAssign: true, pointsMultiplier: multiplier * 0.8 },
    { templateName: 'Faire les courses', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Vérifier dates de péremption', shouldAssign: true, pointsMultiplier: multiplier * 0.7 }
  )

  if (responses.cooking_frequency !== 'never') {
    assignments.push({ templateName: 'Planifier les repas', shouldAssign: true, pointsMultiplier: multiplier })
  }

  // Bi-hebdomadaires
  assignments.push({ templateName: 'Nettoyer les vitres', shouldAssign: true, pointsMultiplier: multiplier * roomMultiplier })

  // Mensuelles
  assignments.push(
    { templateName: 'Nettoyer tous les interrupteurs', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier },
    { templateName: 'Dépoussiérer toutes plinthes', shouldAssign: cleanlinessLevel >= 3 || hasAllergies, pointsMultiplier: multiplier * allergyMultiplier },
    { templateName: 'Nettoyer les portes', shouldAssign: cleanlinessLevel >= 4, pointsMultiplier: multiplier },
    { templateName: 'Descendre toiles d\'araignée', shouldAssign: true, pointsMultiplier: multiplier * 0.9 },
    { templateName: 'Nettoyer les luminaires', shouldAssign: cleanlinessLevel >= 3, pointsMultiplier: multiplier },
    { templateName: 'Organiser papiers administratifs', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Vérifier détecteurs de fumée', shouldAssign: true, pointsMultiplier: multiplier * 0.7 }
  )

  if (!hasRobotVacuum) {
    assignments.push(
      { templateName: 'Remplacer sacs aspirateur', shouldAssign: true, pointsMultiplier: multiplier * 0.5 },
      { templateName: 'Nettoyer filtres aspirateur', shouldAssign: true, pointsMultiplier: multiplier * 0.8 }
    )
  }

  // Trimestrielles
  assignments.push(
    { templateName: 'Nettoyer derrière les meubles', shouldAssign: cleanlinessLevel >= 3 || hasAllergies, pointsMultiplier: multiplier * allergyMultiplier },
    { templateName: 'Remplacer les ampoules', shouldAssign: true, pointsMultiplier: multiplier * 0.6 }
  )

  // Aspirateur général si pas robot
  if (!hasRobotVacuum && floorType !== 'tile') {
    assignments.push({ templateName: 'Passer l\'aspirateur - général', shouldAssign: true, pointsMultiplier: multiplier * roomMultiplier })
  }

  // ====== ANIMAUX (10 tâches) - SI HAS_PETS ======
  if (responses.has_pets && responses.pet_types && responses.pet_types.length > 0) {
    const hasCats = responses.pet_types.includes('cat')
    const hasDogs = responses.pet_types.includes('dog')
    const hasOtherPets = responses.pet_types.includes('other')

    // Quotidiennes
    if (hasCats) {
      assignments.push(
        { templateName: 'Changer la litière du chat', shouldAssign: true, pointsMultiplier: multiplier * 1.1 },
        { templateName: 'Nettoyer autour litière/cage', shouldAssign: true, pointsMultiplier: multiplier * 0.8 }
      )
    }

    if (hasDogs || hasCats) {
      assignments.push({ templateName: 'Laver les gamelles', shouldAssign: true, pointsMultiplier: multiplier * 0.7 })
    }

    // Hebdomadaires
    if (hasCats) {
      assignments.push({ templateName: 'Nettoyer bac à litière profond', shouldAssign: true, pointsMultiplier: multiplier })
    }

    if (hasDogs || hasCats) {
      assignments.push(
        { templateName: 'Laver panier/coussin animal', shouldAssign: true, pointsMultiplier: multiplier },
        { templateName: 'Aspirer poils sur canapé', shouldAssign: true, pointsMultiplier: multiplier * 1.2 },
        { templateName: 'Nettoyer jouets de l\'animal', shouldAssign: true, pointsMultiplier: multiplier * 0.8 },
        { templateName: 'Laver plaids/couvertures à poils', shouldAssign: true, pointsMultiplier: multiplier },
        { templateName: 'Brosser l\'animal', shouldAssign: true, pointsMultiplier: multiplier }
      )
    }

    if (hasOtherPets) {
      assignments.push({ templateName: 'Nettoyer la cage', shouldAssign: true, pointsMultiplier: multiplier })
    }

    // Ajouter la tâche générale d'enlever les poils
    assignments.push({ templateName: 'Enlever les poils d\'animaux', shouldAssign: true, pointsMultiplier: multiplier * 1.3 })
  }

  // ====== ENFANTS (10 tâches) - SI HAS_CHILDREN ======
  if (responses.has_children) {
    // Quotidiennes
    assignments.push(
      { templateName: 'Ranger jouets dans les bacs', shouldAssign: true, pointsMultiplier: multiplier * 1.1 },
      { templateName: 'Ranger les jouets', shouldAssign: true, pointsMultiplier: multiplier * 1.1 },
      { templateName: 'Nettoyer la chaise haute', shouldAssign: true, pointsMultiplier: multiplier * 0.9 },
      { templateName: 'Désinfecter table à langer', shouldAssign: true, pointsMultiplier: multiplier * 0.7 }
    )

    // 2-3x/semaine
    assignments.push({ templateName: 'Changer linge de lit bébé', shouldAssign: true, pointsMultiplier: multiplier })

    // Hebdomadaires
    assignments.push(
      { templateName: 'Nettoyer les jouets', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Nettoyer parc/tapis d\'éveil', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Ranger livres et jeux', shouldAssign: true, pointsMultiplier: multiplier * 0.8 }
    )

    // Mensuelles
    assignments.push(
      { templateName: 'Laver les peluches', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Organiser vêtements enfants', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Trier dessins et créations', shouldAssign: true, pointsMultiplier: multiplier * 0.8 }
    )
  }

  // ====== SAISONNIER (15 tâches) ======
  // On assigne les tâches saisonnières pour tous (elles ne reviendront que 1-4x/an)
  assignments.push(
    { templateName: 'Ranger vêtements hiver/été', shouldAssign: true, pointsMultiplier: multiplier * 1.2 },
    { templateName: 'Nettoyer radiateurs avant hiver', shouldAssign: true, pointsMultiplier: multiplier },
    { templateName: 'Vérifier joints de fenêtres', shouldAssign: responses.housing_type === 'house', pointsMultiplier: multiplier }
  )

  if (responses.has_ac) {
    assignments.push({ templateName: 'Nettoyer ventilateurs/clim été', shouldAssign: true, pointsMultiplier: multiplier })
  }

  if (responses.housing_type === 'house') {
    assignments.push(
      { templateName: 'Nettoyer les gouttières', shouldAssign: true, pointsMultiplier: multiplier * 1.3 },
      { templateName: 'Nettoyer volets extérieurs', shouldAssign: true, pointsMultiplier: multiplier }
    )
  }

  if (responses.has_outdoor_space) {
    if (responses.outdoor_type === 'garden') {
      assignments.push(
        { templateName: 'Tailler les haies', shouldAssign: true, pointsMultiplier: multiplier * 1.2 },
        { templateName: 'Nettoyer le barbecue', shouldAssign: true, pointsMultiplier: multiplier },
        { templateName: 'Ranger mobilier de jardin', shouldAssign: true, pointsMultiplier: multiplier },
        { templateName: 'Préparer jardin pour hiver', shouldAssign: true, pointsMultiplier: multiplier * 1.1 },
        { templateName: 'Nettoyer abords de la maison', shouldAssign: true, pointsMultiplier: multiplier }
      )
    }

    assignments.push({ templateName: 'Entretien plantes intérieur', shouldAssign: true, pointsMultiplier: multiplier * 0.9 })

    if (responses.outdoor_type === 'balcony' || responses.outdoor_type === 'terrace') {
      assignments.push({ templateName: 'Nettoyer les moustiquaires', shouldAssign: true, pointsMultiplier: multiplier })
    }
  }

  if (responses.housing_type === 'house') {
    assignments.push(
      { templateName: 'Vérifier l\'isolation', shouldAssign: true, pointsMultiplier: multiplier },
      { templateName: 'Déneiger entrée/balcon', shouldAssign: true, pointsMultiplier: multiplier * 0.8 }
    )
  }

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
