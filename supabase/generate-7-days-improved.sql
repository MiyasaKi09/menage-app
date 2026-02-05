-- ============================================
-- GÉNÉRATION INTELLIGENTE DU PLANNING (7 JOURS)
-- ============================================
-- Respecte available_minutes_daily et priorise correctement

DO $$
DECLARE
  v_household_id UUID;
  v_available_minutes INT;
  v_flexible_minutes INT;
  v_date DATE;
  v_task RECORD;
  v_day_total INT;
  v_grand_total INT := 0;
BEGIN
  -- Trouver le foyer
  SELECT id INTO v_household_id FROM households ORDER BY created_at DESC LIMIT 1;

  -- Récupérer available_minutes_daily (default 60)
  SELECT COALESCE(pq.available_minutes_daily, 60)
  INTO v_available_minutes
  FROM household_members hm
  LEFT JOIN profile_questionnaire pq ON hm.profile_id = pq.profile_id
  WHERE hm.household_id = v_household_id
  LIMIT 1;

  -- Ajouter 15% de flexibilité
  v_flexible_minutes := FLOOR(v_available_minutes * 1.15);

  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'GÉNÉRATION INTELLIGENTE - 7 JOURS';
  RAISE NOTICE 'FOYER ID: %', v_household_id;
  RAISE NOTICE 'Budget quotidien: % min (flexible: % min)', v_available_minutes, v_flexible_minutes;
  RAISE NOTICE '════════════════════════════════════════';

  -- Générer pour les 7 prochains jours
  FOR i IN 0..6 LOOP
    v_date := CURRENT_DATE + (i || ' days')::INTERVAL;
    v_day_total := 0;

    -- Nettoyer les anciennes entrées
    DELETE FROM scheduled_tasks
    WHERE household_id = v_household_id
      AND scheduled_date = v_date;

    -- Sélectionner les tâches avec scoring de priorité
    FOR v_task IN (
      SELECT
        ht.id as household_task_id,
        tt.name,
        COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as duration,
        COALESCE(ht.custom_points, tt.base_points) as points,
        ht.preferred_assignee_id,
        ht.next_due_at,
        f.code as frequency_code,
        -- Calcul de priorité
        CASE
          -- Overdue: très haute priorité
          WHEN ht.next_due_at < v_date THEN
            1000 + ((v_date::date - ht.next_due_at::date) * 50)
          -- Due aujourd'hui: haute priorité, ajustée par fréquence
          WHEN ht.next_due_at = v_date THEN
            500 + (
              CASE
                WHEN f.code = 'daily' THEN 100  -- Quotidien = très important
                WHEN f.code = '2-3x_week' THEN 90
                WHEN f.code = 'weekly' THEN 70
                WHEN f.code = 'biweekly' THEN 50
                WHEN f.code = 'monthly' THEN 30
                ELSE 20
              END
            )
          -- Future: basse priorité
          ELSE 0
        END as priority
      FROM household_tasks ht
      JOIN task_templates tt ON ht.template_id = tt.id
      JOIN frequencies f ON tt.frequency_id = f.id
      WHERE ht.household_id = v_household_id
        AND ht.is_active = true
        AND ht.next_due_at <= v_date
      ORDER BY
        priority DESC,           -- Plus haute priorité d'abord
        duration ASC            -- Puis tâches courtes d'abord
    ) LOOP
      -- Vérifier si la tâche rentre dans le budget
      IF v_day_total + v_task.duration <= v_flexible_minutes THEN
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

        v_day_total := v_day_total + v_task.duration;
        v_grand_total := v_grand_total + 1;

      -- Autoriser jusqu'à 20% de dépassement pour tâches en retard
      ELSIF v_task.priority >= 1000
        AND v_day_total + v_task.duration <= (v_available_minutes * 1.20) THEN

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

        v_day_total := v_day_total + v_task.duration;
        v_grand_total := v_grand_total + 1;
      END IF;

      -- Arrêter si on dépasse la limite flexible
      EXIT WHEN v_day_total >= v_flexible_minutes;
    END LOOP;

    RAISE NOTICE '  % : % tâches (% min)', v_date,
      (SELECT COUNT(*) FROM scheduled_tasks
       WHERE household_id = v_household_id AND scheduled_date = v_date),
      v_day_total;
  END LOOP;

  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ TOTAL: % tâches sur 7 jours', v_grand_total;
  RAISE NOTICE '════════════════════════════════════════';
END;
$$;
