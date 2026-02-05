-- Vérifier si next_due_at a été initialisé
SELECT
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE next_due_at IS NULL) as null_count,
  COUNT(*) FILTER (WHERE next_due_at IS NOT NULL) as initialized_count,
  COUNT(*) FILTER (WHERE next_due_at = CURRENT_DATE) as due_today,
  COUNT(*) FILTER (WHERE next_due_at <= CURRENT_DATE) as due_now_or_overdue
FROM household_tasks
WHERE is_active = true;
