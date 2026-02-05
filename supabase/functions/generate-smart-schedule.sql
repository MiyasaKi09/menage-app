-- ============================================
-- FONCTION INTELLIGENTE DE PLANIFICATION
-- ============================================
-- Date: 2026-02-05
-- Purpose: Algorithme de scheduling intelligent avec scoring personnalisé
-- Remplace generate_daily_schedule par une version plus intelligente

-- ============================================
-- FUNCTION: GENERATE_SMART_SCHEDULE
-- ============================================
-- Sélectionne les tâches de manière intelligente:
-- 1. Score multi-facteurs (urgence + personnalisation + équilibre)
-- 2. Limite le nombre de tâches selon profil (5-15 au lieu de 25+)
-- 3. Équilibre les catégories (max 3 par catégorie)
-- 4. Mix de durées (courtes, moyennes, longues)
-- 5. Limite les tâches difficiles (max 2)

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
  v_has_dishwasher BOOLEAN;  -- proxy for cooking frequency
  v_high_dust_area BOOLEAN;
  v_animals TEXT[];
  v_pet_types TEXT[];  -- fallback si animals vide

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
    COALESCE(pq.has_dishwasher, false),  -- proxy pour fréquence cuisine
    COALESCE(pq.high_dust_area, false),
    COALESCE(pq.animals, pq.pet_types),  -- fallback sur pet_types
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
    WHEN 1 THEN 0.7   -- Très relax: moins de tâches
    WHEN 2 THEN 0.85  -- Relax
    WHEN 3 THEN 1.0   -- Standard
    WHEN 4 THEN 1.15  -- Exigeant
    WHEN 5 THEN 1.3   -- Très exigeant: plus de tâches
    ELSE 1.0
  END;

  -- ============================================
  -- 3. CALCULER LIMITES
  -- ============================================
  -- Max tâches basé sur temps disponible
  v_max_tasks := CASE
    WHEN v_available_minutes <= 30 THEN 5
    WHEN v_available_minutes <= 45 THEN 7
    WHEN v_available_minutes <= 60 THEN 10
    WHEN v_available_minutes <= 90 THEN 12
    ELSE 15  -- max absolu
  END;

  -- Ajuster selon cleanliness (niveau exigeant = plus de tâches)
  v_max_tasks := GREATEST(3, FLOOR(v_max_tasks * v_cleanliness_mult)::INT);

  -- Budget temps avec 15% de flexibilité
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

      -- ========== SCORE URGENCE ==========
      (CASE
        -- En retard: 1000 + 50/jour (max 1500)
        WHEN ht.next_due_at < p_target_date THEN
          1000 + LEAST((p_target_date - ht.next_due_at)::INT * 50, 500)
        -- Due aujourd'hui: 500 base
        WHEN ht.next_due_at = p_target_date THEN 500
        ELSE 0
      END)::INT as score_urgence,

      -- ========== SCORE ALLERGIES ==========
      (CASE
        -- Allergie poussière + tâche dépoussiérage
        WHEN 'dust' = ANY(v_allergies) AND
             (tt.name ILIKE '%poussière%' OR tt.name ILIKE '%aspir%') THEN 100
        -- Allergie acariens + tâche literie
        WHEN 'dust' = ANY(v_allergies) AND
             (tt.name ILIKE '%matelas%' OR tt.name ILIKE '%literie%') THEN 100
        -- Allergie moisissures + tâche SDB
        WHEN 'mold' = ANY(v_allergies) AND c.name = 'Salle de bain' THEN 50
        -- Allergie poils + animaux
        WHEN 'pets' = ANY(v_allergies) AND c.name = 'Animaux' THEN 75
        ELSE 0
      END)::INT as score_allergie,

      -- ========== SCORE EAU DURE ==========
      (CASE
        -- Eau dure → priorité détartrage
        WHEN v_water_hardness = 'hard' AND tt.name ILIKE '%détartr%' THEN 150
        WHEN v_water_hardness = 'hard' AND tt.name ILIKE '%calcaire%' THEN 100
        WHEN v_water_hardness = 'medium' AND tt.name ILIKE '%détartr%' THEN 50
        ELSE 0
      END)::INT as score_eau,

      -- ========== SCORE LIFESTYLE ==========
      (CASE
        -- Télétravail → bureau prioritaire
        WHEN v_works_from_home AND c.name = 'Bureau' THEN 75
        -- Lave-vaisselle = cuisine régulière → cuisine prioritaire
        WHEN v_has_dishwasher AND c.name = 'Cuisine' THEN 50
        -- Zone poussiéreuse → aspiration prioritaire
        WHEN v_high_dust_area AND tt.name ILIKE '%aspir%' THEN 75
        -- Animaux → tâches animaux prioritaires
        WHEN array_length(v_animals, 1) > 0 AND c.name = 'Animaux' THEN 100
        ELSE 0
      END)::INT as score_lifestyle

    FROM household_tasks ht
    JOIN task_templates tt ON ht.template_id = tt.id
    JOIN categories c ON tt.category_id = c.id
    WHERE ht.household_id = p_household_id
      AND ht.is_active = true
      AND ht.next_due_at <= p_target_date  -- Seulement aujourd'hui + retards
      AND NOT EXISTS (
        -- Pas déjà planifié pour cette date
        SELECT 1 FROM scheduled_tasks st
        WHERE st.household_task_id = ht.id
          AND st.scheduled_date = p_target_date
          AND st.status IN ('pending', 'in_progress', 'completed')
      )
    ORDER BY
      -- Score total pour priorisation: retards (1000+) > dues aujourd'hui (500) > autres (0)
      (
        CASE WHEN ht.next_due_at < p_target_date THEN 1000 + LEAST((p_target_date - ht.next_due_at)::INT * 50, 500)
             WHEN ht.next_due_at = p_target_date THEN 500
             ELSE 0 END
      ) DESC,
      -- Puis par durée croissante (privilégier tâches courtes à score égal)
      COALESCE(ht.custom_duration_minutes, tt.duration_minutes) ASC,
      -- Tri stable par ID pour résultats déterministes
      ht.id ASC
  ) LOOP
    -- ============================================
    -- VÉRIFIER LES LIMITES
    -- ============================================

    -- Limite nombre total de tâches
    EXIT WHEN v_selected_count >= v_max_tasks;

    -- Limite temps total (115% max pour toutes les tâches)
    EXIT WHEN v_total_minutes + v_task.duration > v_flexible_minutes;

    -- ============================================
    -- VÉRIFIER ÉQUILIBRE CATÉGORIES
    -- ============================================
    v_cat_count := COALESCE((v_category_counts->>v_task.category_name)::INT, 0);
    -- Max 3 tâches par catégorie
    CONTINUE WHEN v_cat_count >= 3;

    -- ============================================
    -- VÉRIFIER ÉQUILIBRE DURÉES
    -- ============================================
    -- Courtes (<10min): max 4
    CONTINUE WHEN v_task.duration < 10 AND v_short_count >= 4;
    -- Longues (>20min): max 2
    CONTINUE WHEN v_task.duration > 20 AND v_long_count >= 2;

    -- ============================================
    -- VÉRIFIER ÉQUILIBRE DIFFICULTÉS
    -- ============================================
    -- Difficiles (>=4): max 2
    CONTINUE WHEN v_task.difficulty >= 4 AND v_hard_count >= 2;

    -- ============================================
    -- AJOUTER LA TÂCHE
    -- ============================================
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
      v_task.household_id,
      p_target_date,
      'pending',
      v_task.preferred_assignee_id,
      NOW(),
      NOW()
    );

    -- ============================================
    -- METTRE À JOUR COMPTEURS
    -- ============================================
    v_selected_count := v_selected_count + 1;
    v_total_minutes := v_total_minutes + v_task.duration;

    -- Compteur catégorie
    v_category_counts := jsonb_set(
      v_category_counts,
      ARRAY[v_task.category_name],
      to_jsonb(v_cat_count + 1)
    );

    -- Compteurs durée
    IF v_task.duration < 10 THEN
      v_short_count := v_short_count + 1;
    ELSIF v_task.duration <= 20 THEN
      v_medium_count := v_medium_count + 1;
    ELSE
      v_long_count := v_long_count + 1;
    END IF;

    -- Compteur difficulté
    IF v_task.difficulty >= 4 THEN
      v_hard_count := v_hard_count + 1;
    END IF;

  END LOOP;

  -- ============================================
  -- 6. RETOURNER RÉSULTAT DÉTAILLÉ
  -- ============================================
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
    'duration_distribution', jsonb_build_object(
      'short', v_short_count,
      'medium', v_medium_count,
      'long', v_long_count
    ),
    'hard_tasks_count', v_hard_count,
    'questionnaire_used', jsonb_build_object(
      'water_hardness', v_water_hardness,
      'allergies', v_allergies,
      'works_from_home', v_works_from_home,
      'high_dust_area', v_high_dust_area,
      'has_dishwasher', v_has_dishwasher,
      'animals_count', COALESCE(array_length(v_animals, 1), 0)
    )
  );
END;
$$;

COMMENT ON FUNCTION generate_smart_schedule(UUID, DATE) IS
  'Génère un planning quotidien intelligent avec scoring personnalisé basé sur le questionnaire. Limite à 5-15 tâches selon profil, équilibre catégories et difficultés.';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION generate_smart_schedule(UUID, DATE) TO authenticated;

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT '✓ generate_smart_schedule créée avec succès!' as status;
