-- Tester la requête exacte utilisée par le frontend
-- Cette requête simule ce que fait app/(protected)/tasks/page.tsx

-- Vérifier que le user peut voir les household_tasks avec les joins
SELECT
  ht.id,
  ht.household_id,
  ht.custom_points,
  ht.is_active,
  tt.id as template_id,
  tt.name as template_name,
  tt.tip,
  tt.base_points,
  tt.duration_minutes,
  c.name as category_name,
  c.emoji as category_emoji
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
JOIN categories c ON tt.category_id = c.id
WHERE ht.household_id = '9d191766-c47e-4d9d-b5af-87b287e5037f'
  AND ht.is_active = true
ORDER BY tt.name
LIMIT 10;

-- Vérifier s'il y a des tâches inactives
SELECT
  'Active tasks' as label,
  COUNT(*) as count
FROM household_tasks
WHERE household_id = '9d191766-c47e-4d9d-b5af-87b287e5037f'
  AND is_active = true;

SELECT
  'Inactive tasks' as label,
  COUNT(*) as count
FROM household_tasks
WHERE household_id = '9d191766-c47e-4d9d-b5af-87b287e5037f'
  AND is_active = false;
