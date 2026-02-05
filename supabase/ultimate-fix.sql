-- ============================================
-- SCRIPT ULTIME - TOUT RÉPARER EN UNE FOIS
-- ============================================

DO $$
DECLARE
  v_household_id UUID;
  v_available_minutes INT;
  v_tasks_count INT;
  v_initialized_count INT;
  v_result JSONB;
  v_task RECORD;
BEGIN
  -- ========================================
  -- ÉTAPE 1: DIAGNOSTIC INITIAL
  -- ========================================

  -- Trouver le foyer
  SELECT id INTO v_household_id FROM households ORDER BY created_at DESC LIMIT 1;
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'FOYER ID: %', v_household_id;

  -- Compter les tâches actives
  SELECT COUNT(*) INTO v_tasks_count
  FROM household_tasks
  WHERE household_id = v_household_id AND is_active = true;
  RAISE NOTICE 'Tâches actives: %', v_tasks_count;

  -- Vérifier available_minutes
  SELECT COALESCE(pq.available_minutes_daily, 60) INTO v_available_minutes
  FROM household_members hm
  LEFT JOIN profile_questionnaire pq ON hm.profile_id = pq.profile_id
  WHERE hm.household_id = v_household_id
  LIMIT 1;
  RAISE NOTICE 'Minutes disponibles/jour: %', v_available_minutes;

  IF v_tasks_count = 0 THEN
    RAISE NOTICE '❌ ERREUR: Aucune tâche active!';
    RETURN;
  END IF;

  -- ========================================
  -- ÉTAPE 2: INITIALISER LES DATES
  -- ========================================

  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'INITIALISATION DES DATES...';

  UPDATE household_tasks ht
  SET next_due_at = CURRENT_DATE,
      updated_at = NOW()
  FROM task_templates tt
  WHERE ht.household_id = v_household_id
    AND ht.is_active = true
    AND ht.next_due_at IS NULL
    AND ht.template_id = tt.id;

  GET DIAGNOSTICS v_initialized_count = ROW_COUNT;
  RAISE NOTICE '✓ % tâches initialisées avec next_due_at = TODAY', v_initialized_count;

  -- ========================================
  -- ÉTAPE 3: NETTOYER LES ANCIENNES ENTRÉES
  -- ========================================

  DELETE FROM scheduled_tasks
  WHERE household_id = v_household_id
    AND scheduled_date = CURRENT_DATE;

  RAISE NOTICE '✓ Anciennes entrées nettoyées';

  -- ========================================
  -- ÉTAPE 4: GÉNÉRER LE PLANNING MANUELLEMENT
  -- ========================================

  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'GÉNÉRATION DU PLANNING...';

  -- Sélectionner les tâches qui rentrent dans le budget temps
  FOR v_task IN (
    SELECT
      ht.id as household_task_id,
      tt.name,
      COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as duration,
      COALESCE(ht.custom_points, tt.base_points) as points,
      ht.preferred_assignee_id
    FROM household_tasks ht
    JOIN task_templates tt ON ht.template_id = tt.id
    WHERE ht.household_id = v_household_id
      AND ht.is_active = true
      AND ht.next_due_at <= CURRENT_DATE
    ORDER BY ht.next_due_at ASC, duration ASC
    LIMIT 10  -- Limiter à 10 tâches pour commencer
  ) LOOP
    -- Créer l'entrée scheduled_task
    INSERT INTO scheduled_tasks (
      household_task_id,
      household_id,
      scheduled_date,
      status,
      assigned_to,
      created_at,
      updated_at
    ) VALUES (
      v_task.household_task_id,
      v_household_id,
      CURRENT_DATE,
      'pending',
      v_task.preferred_assignee_id,
      NOW(),
      NOW()
    );

    RAISE NOTICE '  ✓ Planifié: % (% min, % pts)', v_task.name, v_task.duration, v_task.points;
  END LOOP;

  -- ========================================
  -- ÉTAPE 5: VÉRIFICATION FINALE
  -- ========================================

  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'VÉRIFICATION FINALE:';

  SELECT COUNT(*) INTO v_tasks_count
  FROM scheduled_tasks
  WHERE household_id = v_household_id
    AND scheduled_date = CURRENT_DATE;

  RAISE NOTICE '✓ % tâches planifiées pour aujourd''hui', v_tasks_count;
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ TERMINÉ! Actualisez /tasks/schedule';
  RAISE NOTICE '════════════════════════════════════════';
END;
$$;
