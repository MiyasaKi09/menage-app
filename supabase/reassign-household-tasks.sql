-- ============================================
-- RÉASSIGNER LES TÂCHES À UN FOYER
-- ============================================
-- Exécuter après seed-task-templates-v3.sql

DO $$
DECLARE
  v_household_id UUID := '9d191766-c47e-4d9d-b5af-87b287e5037f';
  v_task_count INT := 0;
  v_universal_count INT := 0;
  v_conditional_count INT := 0;

  -- Variables du questionnaire
  v_has_dishwasher BOOLEAN := FALSE;
  v_has_dryer BOOLEAN := FALSE;
  v_has_robot_vacuum BOOLEAN := FALSE;
  v_has_children BOOLEAN := FALSE;
  v_has_pets BOOLEAN := FALSE;
  v_has_outdoor BOOLEAN := FALSE;
  v_outdoor_type VARCHAR(30) := NULL;
  v_water_hardness VARCHAR(20) := 'medium';
BEGIN
  RAISE NOTICE 'Réassignation des tâches pour le foyer: %', v_household_id;

  -- Récupérer les données du questionnaire
  SELECT
    pq.has_dishwasher,
    pq.has_dryer,
    pq.has_robot_vacuum,
    pq.has_children,
    pq.has_pets,
    pq.has_outdoor_space,
    pq.outdoor_type,
    pq.water_hardness
  INTO
    v_has_dishwasher,
    v_has_dryer,
    v_has_robot_vacuum,
    v_has_children,
    v_has_pets,
    v_has_outdoor,
    v_outdoor_type,
    v_water_hardness
  FROM profile_questionnaire pq
  JOIN profiles p ON p.id = pq.profile_id
  JOIN household_members hm ON hm.profile_id = p.id
  WHERE hm.household_id = v_household_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE NOTICE '⚠ Pas de questionnaire trouvé, assignation des tâches universelles uniquement';
  ELSE
    RAISE NOTICE '✓ Questionnaire trouvé:';
    RAISE NOTICE '  - Lave-vaisselle: %', v_has_dishwasher;
    RAISE NOTICE '  - Sèche-linge: %', v_has_dryer;
    RAISE NOTICE '  - Robot aspirateur: %', v_has_robot_vacuum;
    RAISE NOTICE '  - Enfants: %', v_has_children;
    RAISE NOTICE '  - Animaux: %', v_has_pets;
    RAISE NOTICE '  - Extérieur: % (%)', v_has_outdoor, v_outdoor_type;
    RAISE NOTICE '  - Dureté eau: %', v_water_hardness;
  END IF;

  -- Supprimer les anciennes assignations
  DELETE FROM household_tasks WHERE household_id = v_household_id;
  RAISE NOTICE '✓ Anciennes tâches supprimées';

  -- 1. Insérer toutes les tâches universelles (condition_code IS NULL)
  INSERT INTO household_tasks (household_id, template_id, is_active)
  SELECT v_household_id, id, TRUE
  FROM task_templates
  WHERE condition_code IS NULL;

  GET DIAGNOSTICS v_universal_count = ROW_COUNT;
  RAISE NOTICE '✓ % tâches universelles assignées', v_universal_count;

  -- 2. Tâches conditionnelles basées sur le questionnaire

  -- Lave-vaisselle
  IF v_has_dishwasher THEN
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code = 'lave_vaisselle';
  ELSE
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code = 'pas_lave_vaisselle';
  END IF;

  -- Robot aspirateur
  IF v_has_robot_vacuum THEN
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code IN ('robot_aspirateur');
  ELSE
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code IN ('pas_robot_aspirateur');
  END IF;

  -- Sèche-linge
  IF v_has_dryer THEN
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code = 'seche_linge';
  ELSE
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code = 'pas_seche_linge';
  END IF;

  -- Robot laveur (pas de robot = on assigne ces tâches)
  IF NOT v_has_robot_vacuum THEN
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code = 'pas_robot_laveur';
  END IF;

  -- Enfants
  IF v_has_children THEN
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code IN ('enfants', 'bebe');
  END IF;

  -- Animaux
  IF v_has_pets THEN
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code IN ('animaux', 'animaux_poils', 'chat', 'chien');
  END IF;

  -- Extérieur
  IF v_has_outdoor THEN
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code IN ('balcon_terrasse', 'plantes_exterieur', 'mobilier_jardin');

    IF v_outdoor_type = 'garden' THEN
      INSERT INTO household_tasks (household_id, template_id, is_active)
      SELECT v_household_id, id, TRUE
      FROM task_templates
      WHERE condition_code IN ('jardin', 'pelouse', 'haies', 'potager');
    END IF;
  END IF;

  -- Eau dure
  IF v_water_hardness = 'hard' THEN
    INSERT INTO household_tasks (household_id, template_id, is_active)
    SELECT v_household_id, id, TRUE
    FROM task_templates
    WHERE condition_code = 'eau_dure';
  END IF;

  -- Tâches de bureau (toujours assignées car courantes)
  INSERT INTO household_tasks (household_id, template_id, is_active)
  SELECT v_household_id, id, TRUE
  FROM task_templates
  WHERE condition_code = 'bureau';

  -- Compter les tâches conditionnelles ajoutées
  SELECT COUNT(*) - v_universal_count INTO v_conditional_count
  FROM household_tasks
  WHERE household_id = v_household_id;

  -- Total final
  SELECT COUNT(*) INTO v_task_count
  FROM household_tasks
  WHERE household_id = v_household_id;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ RÉASSIGNATION TERMINÉE';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'Foyer: %', v_household_id;
  RAISE NOTICE 'Tâches universelles: %', v_universal_count;
  RAISE NOTICE 'Tâches conditionnelles: %', v_conditional_count;
  RAISE NOTICE 'TOTAL: % tâches assignées', v_task_count;
  RAISE NOTICE '════════════════════════════════════════';

END $$;

-- Vérification finale
SELECT
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE is_active) as active_tasks
FROM household_tasks
WHERE household_id = '9d191766-c47e-4d9d-b5af-87b287e5037f';
