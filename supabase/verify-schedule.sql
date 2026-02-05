-- Vérification rapide du planning généré

-- 1. Vérifier next_due_at
SELECT
  'NEXT_DUE_AT STATUS' as check,
  COUNT(*) as total_active_tasks,
  COUNT(*) FILTER (WHERE next_due_at IS NULL) as still_null,
  COUNT(*) FILTER (WHERE next_due_at IS NOT NULL) as initialized
FROM household_tasks
WHERE is_active = true;

-- 2. Vérifier scheduled_tasks créés
SELECT
  'SCHEDULED_TASKS CREATED' as check,
  COUNT(*) as total_scheduled,
  COUNT(DISTINCT scheduled_date) as days_covered,
  MIN(scheduled_date) as first_day,
  MAX(scheduled_date) as last_day
FROM scheduled_tasks;

-- 3. Détail par jour
SELECT
  scheduled_date,
  COUNT(*) as task_count,
  SUM(COALESCE(ht.custom_duration_minutes, tt.duration_minutes)) as total_minutes
FROM scheduled_tasks st
JOIN household_tasks ht ON st.household_task_id = ht.id
JOIN task_templates tt ON ht.template_id = tt.id
GROUP BY scheduled_date
ORDER BY scheduled_date;

-- 4. Quelques exemples de tâches planifiées aujourd'hui
SELECT
  tt.name as task_name,
  COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as duration,
  st.status
FROM scheduled_tasks st
JOIN household_tasks ht ON st.household_task_id = ht.id
JOIN task_templates tt ON ht.template_id = tt.id
WHERE st.scheduled_date = CURRENT_DATE
ORDER BY duration DESC
LIMIT 5;
