-- ============================================
-- SCRIPT DE CORRECTION - PLANNING VIDE
-- ============================================
-- Ce script va diagnostiquer ET corriger le problème

-- Étape 1: Identifier votre foyer
DO $$
DECLARE
  v_household_id UUID;
  v_household_name VARCHAR(100);
  v_active_tasks INT;
  v_tasks_without_due_date INT;
  v_available_minutes INT;
  v_scheduled_count INT;
  v_generation_result JSONB;
BEGIN
  -- Récupérer le premier household (ajustez si vous avez plusieurs foyers)
  SELECT id, name INTO v_household_id, v_household_name
  FROM households
  ORDER BY created_at DESC
  LIMIT 1;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNOSTIC POUR: % (ID: %)', v_household_name, v_household_id;
  RAISE NOTICE '========================================';

  -- Vérifier les tâches actives
  SELECT
    COUNT(*) FILTER (WHERE is_active = true),
    COUNT(*) FILTER (WHERE next_due_at IS NULL AND is_active = true)
  INTO v_active_tasks, v_tasks_without_due_date
  FROM household_tasks
  WHERE household_id = v_household_id;

  RAISE NOTICE 'Tâches actives: %', v_active_tasks;
  RAISE NOTICE 'Tâches sans next_due_at: %', v_tasks_without_due_date;

  -- Vérifier available_minutes_daily
  SELECT COALESCE(pq.available_minutes_daily, 60)
  INTO v_available_minutes
  FROM household_members hm
  LEFT JOIN profile_questionnaire pq ON hm.profile_id = pq.profile_id
  WHERE hm.household_id = v_household_id
  LIMIT 1;

  RAISE NOTICE 'Minutes disponibles par jour: %', v_available_minutes;

  -- Vérifier scheduled_tasks
  SELECT COUNT(*)
  INTO v_scheduled_count
  FROM scheduled_tasks
  WHERE household_id = v_household_id
    AND scheduled_date >= CURRENT_DATE;

  RAISE NOTICE 'Tâches déjà planifiées: %', v_scheduled_count;

  -- SI PAS DE TÂCHES ACTIVES: PROBLÈME CRITIQUE
  IF v_active_tasks = 0 THEN
    RAISE NOTICE '❌ PROBLÈME: Aucune tâche active trouvée!';
    RAISE NOTICE 'Solution: Complétez le questionnaire pour assigner des tâches';
    RETURN;
  END IF;

  -- SI TÂCHES SANS DUE DATE: Initialiser
  IF v_tasks_without_due_date > 0 THEN
    RAISE NOTICE '🔧 Initialisation des dates de tâches...';
    PERFORM initialize_task_due_dates(v_household_id);
    RAISE NOTICE '✓ % tâches initialisées', v_tasks_without_due_date;
  END IF;

  -- SI PAS DE TÂCHES PLANIFIÉES: Générer le planning
  IF v_scheduled_count = 0 THEN
    RAISE NOTICE '🔧 Génération du planning pour aujourd''hui...';
    v_generation_result := generate_daily_schedule(v_household_id, CURRENT_DATE);
    RAISE NOTICE '✓ Résultat: %', v_generation_result;
  ELSE
    RAISE NOTICE '✓ Planning déjà existant';
  END IF;

  -- Afficher les tâches planifiées pour aujourd'hui
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TÂCHES PLANIFIÉES POUR AUJOURD''HUI:';
  RAISE NOTICE '========================================';

  FOR v_generation_result IN (
    SELECT jsonb_build_object(
      'task_name', tt.name,
      'duration_minutes', COALESCE(ht.custom_duration_minutes, tt.duration_minutes),
      'points', COALESCE(ht.custom_points, tt.base_points),
      'status', st.status
    )
    FROM scheduled_tasks st
    JOIN household_tasks ht ON st.household_task_id = ht.id
    JOIN task_templates tt ON ht.template_id = tt.id
    WHERE st.household_id = v_household_id
      AND st.scheduled_date = CURRENT_DATE
    ORDER BY st.created_at
  ) LOOP
    RAISE NOTICE '- %', v_generation_result;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ CORRECTION TERMINÉE';
  RAISE NOTICE 'Actualisez la page /tasks/schedule dans votre navigateur';
  RAISE NOTICE '========================================';
END;
$$;
