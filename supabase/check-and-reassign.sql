-- ============================================
-- VÉRIFIER LE QUESTIONNAIRE ET RÉASSIGNER
-- ============================================

-- 1. Vérifier les données du questionnaire via le profile
SELECT
  'profile_questionnaire' as source,
  pq.*,
  p.display_name,
  hm.household_id
FROM profile_questionnaire pq
JOIN profiles p ON p.id = pq.profile_id
JOIN household_members hm ON hm.profile_id = p.id
WHERE hm.household_id = '9d191766-c47e-4d9d-b5af-87b287e5037f';

-- 2. Vérifier aussi questionnaire_responses si elle existe
SELECT 'questionnaire_responses' as source, *
FROM questionnaire_responses
WHERE household_id = '9d191766-c47e-4d9d-b5af-87b287e5037f';

-- 3. Compter les task_templates par catégorie
SELECT
  c.name as category,
  c.emoji,
  COUNT(t.id) as task_count,
  COUNT(t.id) FILTER (WHERE t.condition_code IS NULL) as universal_tasks
FROM categories c
LEFT JOIN task_templates t ON t.category_id = c.id
GROUP BY c.id, c.name, c.emoji
ORDER BY c.display_order;

-- 4. Voir le nombre total de tâches
SELECT
  COUNT(*) as total_templates,
  COUNT(*) FILTER (WHERE condition_code IS NULL) as universal_tasks,
  COUNT(*) FILTER (WHERE condition_code IS NOT NULL) as conditional_tasks
FROM task_templates;
