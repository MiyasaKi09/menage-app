-- Script de debug pour vérifier l'état des tâches

-- 1. Vérifier les task_templates
SELECT 'Task Templates' as check_name, COUNT(*) as count FROM task_templates;
SELECT * FROM task_templates ORDER BY name LIMIT 5;

-- 2. Vérifier les questionnaire_responses
SELECT 'Questionnaire Responses' as check_name, COUNT(*) as count FROM questionnaire_responses;
SELECT
  household_id,
  housing_type,
  room_count,
  household_size,
  cooking_frequency,
  has_dishwasher,
  has_washing_machine,
  has_pets,
  has_children
FROM questionnaire_responses;

-- 3. Vérifier les household_tasks
SELECT 'Household Tasks' as check_name, COUNT(*) as count FROM household_tasks;
SELECT
  ht.id,
  ht.household_id,
  ht.is_active,
  ht.custom_points,
  tt.name as task_name
FROM household_tasks ht
LEFT JOIN task_templates tt ON ht.template_id = tt.id
ORDER BY tt.name;

-- 4. Vérifier les foyers
SELECT 'Households' as check_name, COUNT(*) as count FROM households;
SELECT id, name, invite_code FROM households;

-- 5. Vérifier les membres des foyers
SELECT
  hm.household_id,
  h.name as household_name,
  hm.profile_id,
  p.display_name
FROM household_members hm
JOIN households h ON hm.household_id = h.id
LEFT JOIN profiles p ON hm.profile_id = p.id;
