-- ============================================
-- SCRIPT DE DIAGNOSTIC - SYSTÈME DE PLANIFICATION
-- ============================================
-- Exécutez ce script pour diagnostiquer pourquoi le planning est vide

-- 1. Vérifier que les fonctions RPC existent
SELECT
  proname as function_name,
  pronargs as num_args
FROM pg_proc
WHERE proname IN (
  'initialize_task_due_dates',
  'generate_daily_schedule',
  'get_schedule_for_dates',
  'handle_late_tasks'
)
ORDER BY proname;

-- 2. Vérifier les colonnes de scheduled_tasks
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'scheduled_tasks'
  AND column_name IN ('rollover_count', 'original_scheduled_date')
ORDER BY column_name;

-- 3. Récupérer votre household_id (remplacez l'email si nécessaire)
SELECT
  hm.household_id,
  h.name as household_name,
  p.email
FROM household_members hm
JOIN households h ON hm.household_id = h.id
JOIN profiles p ON hm.profile_id = p.id
WHERE p.email = 'juimgla1e@gmail.com'  -- ← REMPLACEZ PAR VOTRE EMAIL
LIMIT 1;

-- 4. Vérifier les tâches actives pour votre foyer
-- ⚠️ REMPLACEZ 'VOTRE-HOUSEHOLD-ID-ICI' par l'ID obtenu à l'étape 3
SELECT
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN next_due_at IS NULL THEN 1 END) as tasks_without_due_date,
  COUNT(CASE WHEN next_due_at IS NOT NULL THEN 1 END) as tasks_with_due_date,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_tasks
FROM household_tasks
WHERE household_id = 'VOTRE-HOUSEHOLD-ID-ICI';  -- ← REMPLACEZ ICI

-- 5. Vérifier available_minutes_daily
-- ⚠️ REMPLACEZ 'VOTRE-HOUSEHOLD-ID-ICI'
SELECT
  pq.available_minutes_daily,
  p.email
FROM household_members hm
JOIN profiles p ON hm.profile_id = p.id
LEFT JOIN profile_questionnaire pq ON p.id = pq.profile_id
WHERE hm.household_id = 'VOTRE-HOUSEHOLD-ID-ICI'  -- ← REMPLACEZ ICI
LIMIT 1;

-- 6. Vérifier scheduled_tasks
-- ⚠️ REMPLACEZ 'VOTRE-HOUSEHOLD-ID-ICI'
SELECT
  COUNT(*) as total_scheduled,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
  MIN(scheduled_date) as earliest_date,
  MAX(scheduled_date) as latest_date
FROM scheduled_tasks
WHERE household_id = 'VOTRE-HOUSEHOLD-ID-ICI';  -- ← REMPLACEZ ICI

-- 7. Voir un échantillon de tâches avec leur next_due_at
-- ⚠️ REMPLACEZ 'VOTRE-HOUSEHOLD-ID-ICI'
SELECT
  tt.name as task_name,
  ht.next_due_at,
  ht.last_completed_at,
  ht.is_active,
  f.code as frequency,
  f.days_default as frequency_days
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
JOIN frequencies f ON tt.frequency_id = f.id
WHERE ht.household_id = 'VOTRE-HOUSEHOLD-ID-ICI'  -- ← REMPLACEZ ICI
  AND ht.is_active = true
LIMIT 10;
