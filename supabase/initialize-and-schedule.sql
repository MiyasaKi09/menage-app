-- ============================================
-- INITIALISATION ET GÉNÉRATION DU PLANNING
-- ============================================
-- Ce script va initialiser les dates ET générer le planning

DO $$
DECLARE
  v_household_id UUID;
  v_result JSONB;
BEGIN
  -- Récupérer l'ID de votre foyer
  SELECT id INTO v_household_id
  FROM households
  ORDER BY created_at DESC
  LIMIT 1;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'INITIALISATION DU FOYER (ID: %)', v_household_id;
  RAISE NOTICE '========================================';

  -- ÉTAPE 1: Initialiser next_due_at pour toutes les tâches
  RAISE NOTICE '🔧 Étape 1: Initialisation des dates...';
  PERFORM initialize_task_due_dates(v_household_id);
  RAISE NOTICE '✓ Dates initialisées';

  -- ÉTAPE 2: Générer le planning pour aujourd'hui
  RAISE NOTICE '🔧 Étape 2: Génération du planning...';
  v_result := generate_daily_schedule(v_household_id, CURRENT_DATE);
  RAISE NOTICE '✓ Planning généré: %', v_result;

  -- ÉTAPE 3: Afficher les tâches planifiées
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TÂCHES PLANIFIÉES POUR AUJOURD''HUI:';

  FOR v_result IN (
    SELECT jsonb_build_object(
      'task', tt.name,
      'minutes', COALESCE(ht.custom_duration_minutes, tt.duration_minutes),
      'points', COALESCE(ht.custom_points, tt.base_points)
    )
    FROM scheduled_tasks st
    JOIN household_tasks ht ON st.household_task_id = ht.id
    JOIN task_templates tt ON ht.template_id = tt.id
    WHERE st.household_id = v_household_id
      AND st.scheduled_date = CURRENT_DATE
    ORDER BY st.created_at
  ) LOOP
    RAISE NOTICE '  - %', v_result;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ TERMINÉ! Actualisez /tasks/schedule';
  RAISE NOTICE '========================================';
END;
$$;
