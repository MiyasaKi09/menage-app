-- ============================================
-- GÉNÉRER PLANNING POUR 7 JOURS
-- ============================================

DO $$
DECLARE
  v_household_id UUID;
  v_date DATE;
  v_task RECORD;
  v_count INT;
  v_total INT := 0;
BEGIN
  -- Trouver le foyer
  SELECT id INTO v_household_id FROM households ORDER BY created_at DESC LIMIT 1;

  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'GÉNÉRATION PLANNING POUR 7 JOURS';
  RAISE NOTICE 'FOYER ID: %', v_household_id;
  RAISE NOTICE '════════════════════════════════════════';

  -- Générer pour les 7 prochains jours
  FOR i IN 0..6 LOOP
    v_date := CURRENT_DATE + (i || ' days')::INTERVAL;

    -- Nettoyer les anciennes entrées pour cette date
    DELETE FROM scheduled_tasks
    WHERE household_id = v_household_id
      AND scheduled_date = v_date;

    -- Sélectionner et planifier les tâches
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
        AND ht.next_due_at <= v_date
      ORDER BY ht.next_due_at ASC, duration ASC
      LIMIT 10
    ) LOOP
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
        v_date,
        'pending',
        v_task.preferred_assignee_id,
        NOW(),
        NOW()
      );

      v_total := v_total + 1;
    END LOOP;

    -- Compter les tâches planifiées pour ce jour
    SELECT COUNT(*) INTO v_count
    FROM scheduled_tasks
    WHERE household_id = v_household_id
      AND scheduled_date = v_date;

    RAISE NOTICE '  % : % tâches', v_date, v_count;
  END LOOP;

  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ TOTAL: % tâches planifiées sur 7 jours', v_total;
  RAISE NOTICE '════════════════════════════════════════';
END;
$$;
