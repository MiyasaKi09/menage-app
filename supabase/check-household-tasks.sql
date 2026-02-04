-- Vérifier les household_tasks pour le foyer "La Mouff'"
-- ID: 9d191766-c47e-4d9d-b5af-87b287e5037f

SELECT
  ht.id,
  ht.is_active,
  ht.custom_points,
  tt.name as task_name,
  tt.duration_minutes,
  c.name as category_name,
  c.emoji as category_emoji
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
JOIN categories c ON tt.category_id = c.id
WHERE ht.household_id = '9d191766-c47e-4d9d-b5af-87b287e5037f'
ORDER BY c.display_order, tt.name;

-- Compter les tâches actives
SELECT
  'Total tasks' as label,
  COUNT(*) as count
FROM household_tasks
WHERE household_id = '9d191766-c47e-4d9d-b5af-87b287e5037f';

SELECT
  'Active tasks' as label,
  COUNT(*) as count
FROM household_tasks
WHERE household_id = '9d191766-c47e-4d9d-b5af-87b287e5037f'
AND is_active = true;
