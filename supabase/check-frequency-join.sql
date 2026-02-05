-- Vérifier pourquoi le JOIN avec frequencies échoue

-- 1. Compter les tâches SANS le JOIN frequencies
SELECT
  'SANS JOIN FREQUENCIES' as check,
  COUNT(*) as task_count
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
WHERE ht.household_id = (SELECT id FROM households ORDER BY created_at DESC LIMIT 1)
  AND ht.is_active = true
  AND ht.next_due_at <= CURRENT_DATE;

-- 2. Compter les tâches AVEC le JOIN frequencies
SELECT
  'AVEC JOIN FREQUENCIES' as check,
  COUNT(*) as task_count
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
JOIN frequencies f ON tt.frequency_id = f.id
WHERE ht.household_id = (SELECT id FROM households ORDER BY created_at DESC LIMIT 1)
  AND ht.is_active = true
  AND ht.next_due_at <= CURRENT_DATE;

-- 3. Vérifier les frequency_id dans task_templates
SELECT
  'FREQUENCY_ID STATUS' as check,
  COUNT(*) as total_templates,
  COUNT(frequency_id) as has_frequency_id,
  COUNT(*) - COUNT(frequency_id) as null_frequency_id
FROM task_templates;

-- 4. Voir quelques exemples de task_templates sans frequency_id
SELECT
  tt.id,
  tt.name,
  tt.frequency_id,
  CASE WHEN tt.frequency_id IS NULL THEN 'NULL' ELSE 'OK' END as status
FROM task_templates tt
WHERE tt.id IN (
  SELECT ht.template_id
  FROM household_tasks ht
  WHERE ht.household_id = (SELECT id FROM households ORDER BY created_at DESC LIMIT 1)
    AND ht.is_active = true
  LIMIT 10
);
