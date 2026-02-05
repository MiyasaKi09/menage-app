-- Vérifier si l'UPDATE a fonctionné

SELECT
  COUNT(*) as total_templates,
  COUNT(frequency_id) as has_frequency,
  COUNT(*) - COUNT(frequency_id) as still_null
FROM task_templates;

-- Vérifier quelques exemples
SELECT
  tt.name,
  tt.frequency_id,
  f.code as frequency_code,
  f.label as frequency_label
FROM task_templates tt
LEFT JOIN frequencies f ON tt.frequency_id = f.id
LIMIT 10;
