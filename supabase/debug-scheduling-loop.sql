-- Debug: Pourquoi les tâches ne sont pas planifiées?

-- 1. Vérifier available_minutes_daily
SELECT
  'BUDGET TEMPS' as check,
  pq.available_minutes_daily,
  FLOOR(COALESCE(pq.available_minutes_daily, 60) * 1.15) as flexible_minutes
FROM household_members hm
LEFT JOIN profile_questionnaire pq ON hm.profile_id = pq.profile_id
LIMIT 1;

-- 2. Vérifier les durées des tâches
SELECT
  'DURÉES DES TÂCHES' as check,
  MIN(COALESCE(ht.custom_duration_minutes, tt.duration_minutes)) as min_duration,
  MAX(COALESCE(ht.custom_duration_minutes, tt.duration_minutes)) as max_duration,
  AVG(COALESCE(ht.custom_duration_minutes, tt.duration_minutes)) as avg_duration,
  COUNT(*) as total_tasks
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
WHERE ht.is_active = true;

-- 3. Tester la requête de sélection des tâches (comme dans le script)
SELECT
  'TÂCHES SÉLECTIONNÉES POUR AUJOURD''HUI' as check,
  COUNT(*) as task_count
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
JOIN frequencies f ON tt.frequency_id = f.id
WHERE ht.household_id = (SELECT id FROM households ORDER BY created_at DESC LIMIT 1)
  AND ht.is_active = true
  AND ht.next_due_at <= CURRENT_DATE;

-- 4. Voir les 10 premières tâches qui devraient être planifiées
SELECT
  tt.name,
  COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as duration,
  ht.next_due_at,
  f.code as frequency,
  CASE
    WHEN ht.next_due_at < CURRENT_DATE THEN 'OVERDUE'
    WHEN ht.next_due_at = CURRENT_DATE THEN 'DUE TODAY'
    ELSE 'FUTURE'
  END as status
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
JOIN frequencies f ON tt.frequency_id = f.id
WHERE ht.household_id = (SELECT id FROM households ORDER BY created_at DESC LIMIT 1)
  AND ht.is_active = true
  AND ht.next_due_at <= CURRENT_DATE
ORDER BY duration ASC
LIMIT 10;
