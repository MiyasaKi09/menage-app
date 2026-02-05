-- Diagnostic rapide - Pourquoi pas de tâches planifiées?

-- 1. Vérifier scheduled_tasks
SELECT 'SCHEDULED_TASKS:' as check;
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE scheduled_date = CURRENT_DATE) as today
FROM scheduled_tasks;

-- 2. Vérifier next_due_at
SELECT 'NEXT_DUE_AT STATUS:' as check;
SELECT
  COUNT(*) as total_active_tasks,
  COUNT(*) FILTER (WHERE next_due_at IS NULL) as null_due_dates,
  COUNT(*) FILTER (WHERE next_due_at <= CURRENT_DATE) as due_now_or_overdue,
  COUNT(*) FILTER (WHERE next_due_at > CURRENT_DATE) as future
FROM household_tasks
WHERE is_active = true;

-- 3. Voir quelques exemples de next_due_at
SELECT 'SAMPLE NEXT_DUE_AT:' as check;
SELECT
  tt.name as task_name,
  ht.next_due_at,
  CURRENT_DATE as today,
  CASE
    WHEN ht.next_due_at IS NULL THEN 'NULL'
    WHEN ht.next_due_at < CURRENT_DATE THEN 'OVERDUE'
    WHEN ht.next_due_at = CURRENT_DATE THEN 'DUE TODAY'
    ELSE 'FUTURE'
  END as status
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
WHERE ht.is_active = true
LIMIT 10;

-- 4. Vérifier available_minutes_daily
SELECT 'AVAILABLE MINUTES:' as check;
SELECT pq.available_minutes_daily as minutes
FROM household_members hm
LEFT JOIN profile_questionnaire pq ON hm.profile_id = pq.profile_id
LIMIT 1;
