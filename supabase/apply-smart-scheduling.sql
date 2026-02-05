-- ============================================
-- SCRIPT: APPLIQUER LE SCHEDULING INTELLIGENT
-- ============================================
-- Date: 2026-02-05
-- Ce script:
-- 1. Ajoute les colonnes manquantes au questionnaire
-- 2. Crée la fonction generate_smart_schedule
-- 3. Vide les tâches planifiées existantes pour régénération
-- ============================================

-- ============================================
-- ÉTAPE 1: AJOUTER COLONNES QUESTIONNAIRE
-- ============================================
DO $$
BEGIN
  -- Vérifier si la table profile_questionnaire existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profile_questionnaire') THEN
    -- HOUSING - Pièces spéciales
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS has_stairs BOOLEAN DEFAULT FALSE;
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS has_fireplace BOOLEAN DEFAULT FALSE;
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS has_dressing BOOLEAN DEFAULT FALSE;
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS has_office BOOLEAN DEFAULT FALSE;

    -- LIFESTYLE
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS works_from_home BOOLEAN DEFAULT FALSE;

    -- ENVIRONMENT
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS high_dust_area BOOLEAN DEFAULT FALSE;
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS high_pollen_area BOOLEAN DEFAULT FALSE;

    -- ANIMALS
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS animals TEXT[] DEFAULT '{}';

    RAISE NOTICE '✓ Colonnes questionnaire ajoutées/vérifiées';
  ELSE
    RAISE NOTICE '! Table profile_questionnaire non trouvée';
  END IF;
END $$;

-- ============================================
-- ÉTAPE 2: CRÉER LA FONCTION SMART SCHEDULE
-- ============================================
CREATE OR REPLACE FUNCTION generate_smart_schedule(
  p_household_id UUID,
  p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cleanliness_level INT;
  v_available_minutes INT;
  v_water_hardness TEXT;
  v_allergies TEXT[];
  v_works_from_home BOOLEAN;
  v_has_dishwasher BOOLEAN;
  v_high_dust_area BOOLEAN;
  v_animals TEXT[];
  v_pet_types TEXT[];

  v_cleanliness_mult DECIMAL;
  v_max_tasks INT;
  v_flexible_minutes INT;

  v_selected_count INT := 0;
  v_total_minutes INT := 0;
  v_category_counts JSONB := '{}';
  v_short_count INT := 0;
  v_medium_count INT := 0;
  v_long_count INT := 0;
  v_hard_count INT := 0;

  v_task RECORD;
  v_cat_count INT;
BEGIN
  -- ============================================
  -- 1. RÉCUPÉRER DONNÉES DU QUESTIONNAIRE
  -- ============================================
  SELECT
    COALESCE(pq.cleanliness_level, 3),
    COALESCE(pq.available_minutes_daily, 45),
    COALESCE(pq.water_hardness, 'medium'),
    COALESCE(pq.allergies, '{}'),
    COALESCE(pq.works_from_home, false),
    COALESCE(pq.has_dishwasher, false),
    COALESCE(pq.high_dust_area, false),
    COALESCE(pq.animals, pq.pet_types),
    COALESCE(pq.pet_types, '{}')
  INTO
    v_cleanliness_level,
    v_available_minutes,
    v_water_hardness,
    v_allergies,
    v_works_from_home,
    v_has_dishwasher,
    v_high_dust_area,
    v_animals,
    v_pet_types
  FROM household_members hm
  LEFT JOIN profile_questionnaire pq ON hm.profile_id = pq.profile_id
  WHERE hm.household_id = p_household_id
  LIMIT 1;

  -- Merge animals et pet_types
  IF v_animals IS NULL OR array_length(v_animals, 1) IS NULL THEN
    v_animals := v_pet_types;
  END IF;

  -- ============================================
  -- 2. CALCULER MULTIPLICATEUR CLEANLINESS
  -- ============================================
  v_cleanliness_mult := CASE v_cleanliness_level
    WHEN 1 THEN 0.7
    WHEN 2 THEN 0.85
    WHEN 3 THEN 1.0
    WHEN 4 THEN 1.15
    WHEN 5 THEN 1.3
    ELSE 1.0
  END;

  -- ============================================
  -- 3. CALCULER LIMITES
  -- ============================================
  v_max_tasks := CASE
    WHEN v_available_minutes <= 30 THEN 5
    WHEN v_available_minutes <= 45 THEN 7
    WHEN v_available_minutes <= 60 THEN 10
    WHEN v_available_minutes <= 90 THEN 12
    ELSE 15
  END;
  v_max_tasks := GREATEST(3, FLOOR(v_max_tasks * v_cleanliness_mult)::INT);
  v_flexible_minutes := FLOOR(v_available_minutes * 1.15);

  -- ============================================
  -- 4. INITIALISER next_due_at SI MANQUANT
  -- ============================================
  UPDATE household_tasks ht
  SET next_due_at = COALESCE(
    (ht.last_completed_at::DATE + (COALESCE(ht.custom_frequency_days, f.days_default) || ' days')::INTERVAL)::DATE,
    p_target_date
  ),
  updated_at = NOW()
  FROM task_templates tt
  JOIN frequencies f ON tt.frequency_id = f.id
  WHERE ht.household_id = p_household_id
    AND ht.is_active = true
    AND ht.next_due_at IS NULL
    AND ht.template_id = tt.id;

  -- ============================================
  -- 5. SÉLECTION INTELLIGENTE AVEC SCORING
  -- ============================================
  FOR v_task IN (
    SELECT
      ht.id as household_task_id,
      ht.household_id,
      ht.next_due_at,
      ht.preferred_assignee_id,
      tt.name as task_name,
      c.name as category_name,
      COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as duration,
      COALESCE(ht.custom_points, tt.base_points) as points,
      tt.difficulty,

      -- Score urgence: retards (1000+) > dues aujourd'hui (500)
      (CASE
        WHEN ht.next_due_at < p_target_date THEN
          1000 + LEAST((p_target_date - ht.next_due_at)::INT * 50, 500)
        WHEN ht.next_due_at = p_target_date THEN 500
        ELSE 0
      END)::INT as score_urgence,

      -- Score allergies
      (CASE
        WHEN 'dust' = ANY(v_allergies) AND
             (tt.name ILIKE '%poussière%' OR tt.name ILIKE '%aspir%') THEN 100
        WHEN 'dust' = ANY(v_allergies) AND
             (tt.name ILIKE '%matelas%' OR tt.name ILIKE '%literie%') THEN 100
        WHEN 'mold' = ANY(v_allergies) AND c.name = 'Salle de bain' THEN 50
        WHEN 'pets' = ANY(v_allergies) AND c.name = 'Animaux' THEN 75
        ELSE 0
      END)::INT as score_allergie,

      -- Score eau dure
      (CASE
        WHEN v_water_hardness = 'hard' AND tt.name ILIKE '%détartr%' THEN 150
        WHEN v_water_hardness = 'hard' AND tt.name ILIKE '%calcaire%' THEN 100
        WHEN v_water_hardness = 'medium' AND tt.name ILIKE '%détartr%' THEN 50
        ELSE 0
      END)::INT as score_eau,

      -- Score lifestyle
      (CASE
        WHEN v_works_from_home AND c.name = 'Bureau' THEN 75
        WHEN v_has_dishwasher AND c.name = 'Cuisine' THEN 50
        WHEN v_high_dust_area AND tt.name ILIKE '%aspir%' THEN 75
        WHEN array_length(v_animals, 1) > 0 AND c.name = 'Animaux' THEN 100
        ELSE 0
      END)::INT as score_lifestyle

    FROM household_tasks ht
    JOIN task_templates tt ON ht.template_id = tt.id
    JOIN categories c ON tt.category_id = c.id
    WHERE ht.household_id = p_household_id
      AND ht.is_active = true
      AND ht.next_due_at <= p_target_date  -- Seulement aujourd'hui + retards (pas +3 jours)
      AND NOT EXISTS (
        SELECT 1 FROM scheduled_tasks st
        WHERE st.household_task_id = ht.id
          AND st.scheduled_date = p_target_date
          AND st.status IN ('pending', 'in_progress', 'completed')
      )
    ORDER BY
      -- Priorité: retards (1000+) > dues aujourd'hui (500) > autres (0)
      (CASE WHEN ht.next_due_at < p_target_date THEN 1000 + LEAST((p_target_date - ht.next_due_at)::INT * 50, 500)
            WHEN ht.next_due_at = p_target_date THEN 500
            ELSE 0 END) DESC,
      COALESCE(ht.custom_duration_minutes, tt.duration_minutes) ASC,
      ht.id ASC  -- Tri stable
  ) LOOP
    -- Vérifier limites: nombre de tâches
    EXIT WHEN v_selected_count >= v_max_tasks;

    -- Vérifier limites: temps total (115% max pour tous)
    EXIT WHEN v_total_minutes + v_task.duration > v_flexible_minutes;

    -- Équilibre catégories (max 3)
    v_cat_count := COALESCE((v_category_counts->>v_task.category_name)::INT, 0);
    CONTINUE WHEN v_cat_count >= 3;

    -- Équilibre durées
    CONTINUE WHEN v_task.duration < 10 AND v_short_count >= 4;
    CONTINUE WHEN v_task.duration > 20 AND v_long_count >= 2;

    -- Équilibre difficultés (max 2)
    CONTINUE WHEN v_task.difficulty >= 4 AND v_hard_count >= 2;

    -- Ajouter la tâche
    INSERT INTO scheduled_tasks (
      household_task_id, household_id, scheduled_date, status, assigned_to, created_at, updated_at
    ) VALUES (
      v_task.household_task_id, v_task.household_id, p_target_date, 'pending', v_task.preferred_assignee_id, NOW(), NOW()
    );

    -- Mettre à jour compteurs
    v_selected_count := v_selected_count + 1;
    v_total_minutes := v_total_minutes + v_task.duration;
    v_category_counts := jsonb_set(v_category_counts, ARRAY[v_task.category_name], to_jsonb(v_cat_count + 1));

    IF v_task.duration < 10 THEN v_short_count := v_short_count + 1;
    ELSIF v_task.duration <= 20 THEN v_medium_count := v_medium_count + 1;
    ELSE v_long_count := v_long_count + 1;
    END IF;

    IF v_task.difficulty >= 4 THEN v_hard_count := v_hard_count + 1; END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'tasks_scheduled', v_selected_count,
    'total_minutes', v_total_minutes,
    'available_minutes', v_available_minutes,
    'max_tasks', v_max_tasks,
    'target_date', p_target_date,
    'cleanliness_level', v_cleanliness_level,
    'cleanliness_multiplier', v_cleanliness_mult,
    'category_distribution', v_category_counts,
    'duration_distribution', jsonb_build_object('short', v_short_count, 'medium', v_medium_count, 'long', v_long_count),
    'hard_tasks_count', v_hard_count
  );
END;
$$;

COMMENT ON FUNCTION generate_smart_schedule(UUID, DATE) IS
  'Génère un planning quotidien intelligent avec scoring personnalisé. Limite à 5-15 tâches selon profil.';

GRANT EXECUTE ON FUNCTION generate_smart_schedule(UUID, DATE) TO authenticated;

-- ============================================
-- ÉTAPE 3: VIDER LES TÂCHES PLANIFIÉES PENDING
-- ============================================
-- Pour régénérer avec le nouvel algorithme
DELETE FROM scheduled_tasks WHERE status = 'pending';

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT
  'generate_smart_schedule' as function_name,
  pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname = 'generate_smart_schedule';

SELECT '✅ Scheduling intelligent activé!' as status;
SELECT 'Visitez /tasks/schedule pour voir le nouveau planning' as next_step;
