-- ============================================
-- DIAGNOSTIC SIMPLE
-- ============================================

-- 1. Vérifier s'il y a des foyers
SELECT 'FOYERS EXISTANTS:' as info;
SELECT id, name, created_at
FROM households
ORDER BY created_at DESC;

-- 2. Vérifier s'il y a des tâches dans household_tasks
SELECT 'TÂCHES PAR FOYER:' as info;
SELECT
  h.name as foyer,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE ht.is_active = true) as active_tasks,
  COUNT(*) FILTER (WHERE ht.next_due_at IS NOT NULL) as tasks_with_due_date
FROM households h
LEFT JOIN household_tasks ht ON h.id = ht.household_id
GROUP BY h.id, h.name;

-- 3. Vérifier available_minutes_daily
SELECT 'QUESTIONNAIRE CONFIG:' as info;
SELECT
  h.name as foyer,
  p.email,
  pq.available_minutes_daily as minutes_daily
FROM households h
JOIN household_members hm ON h.id = hm.household_id
JOIN profiles p ON hm.profile_id = p.id
LEFT JOIN profile_questionnaire pq ON p.id = pq.profile_id;

-- 4. Vérifier scheduled_tasks
SELECT 'TÂCHES PLANIFIÉES:' as info;
SELECT
  h.name as foyer,
  COUNT(*) as total_scheduled,
  COUNT(*) FILTER (WHERE st.scheduled_date = CURRENT_DATE) as today,
  MIN(st.scheduled_date) as first_date,
  MAX(st.scheduled_date) as last_date
FROM households h
LEFT JOIN scheduled_tasks st ON h.id = st.household_id
GROUP BY h.id, h.name;

-- 5. Échantillon de tâches actives
SELECT 'ÉCHANTILLON TÂCHES ACTIVES (5 premières):' as info;
SELECT
  h.name as foyer,
  tt.name as task_name,
  ht.next_due_at,
  ht.is_active,
  COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as duration_min
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
JOIN households h ON ht.household_id = h.id
WHERE ht.is_active = true
LIMIT 5;
