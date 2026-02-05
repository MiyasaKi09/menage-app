-- Vérification rapide de l'état après initialisation

-- 1. Combien de tâches ont maintenant un next_due_at?
SELECT 'TÂCHES AVEC DATES:' as info;
SELECT
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE next_due_at IS NOT NULL) as with_due_date,
  COUNT(*) FILTER (WHERE next_due_at IS NULL) as still_null
FROM household_tasks
WHERE is_active = true;

-- 2. Combien de tâches planifiées pour aujourd'hui?
SELECT 'PLANNING AUJOURD''HUI (2026-02-05):' as info;
SELECT COUNT(*) as tasks_today
FROM scheduled_tasks
WHERE scheduled_date = '2026-02-05';

-- 3. Liste des tâches planifiées aujourd'hui
SELECT 'DÉTAIL DES TÂCHES AUJOURD''HUI:' as info;
SELECT
  tt.name as task_name,
  st.status,
  COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as minutes
FROM scheduled_tasks st
JOIN household_tasks ht ON st.household_task_id = ht.id
JOIN task_templates tt ON ht.template_id = tt.id
WHERE st.scheduled_date = '2026-02-05'
ORDER BY st.created_at;
