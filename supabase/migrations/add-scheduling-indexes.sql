-- ============================================
-- MIGRATION: ADD SCHEDULING INDEXES AND COLUMNS
-- ============================================
-- Date: 2026-02-05
-- Purpose: Add performance indexes and tracking columns for task scheduling system

-- ============================================
-- 1. ADD PERFORMANCE INDEXES
-- ============================================

-- Speed up queries for tasks due on specific dates
CREATE INDEX IF NOT EXISTS idx_household_tasks_next_due_at
  ON household_tasks(household_id, next_due_at)
  WHERE is_active = true;

-- Speed up queries for pending scheduled tasks by date
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_pending
  ON scheduled_tasks(household_id, scheduled_date, status);

-- Speed up lookups for scheduled tasks with all common filters
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_lookup
  ON scheduled_tasks(household_id, scheduled_date, status, assigned_to);

-- ============================================
-- 2. ADD TRACKING COLUMNS TO SCHEDULED_TASKS
-- ============================================

-- Track how many times a task has been rolled over
ALTER TABLE scheduled_tasks
  ADD COLUMN IF NOT EXISTS rollover_count INT DEFAULT 0;

-- Track the original scheduled date (before any rollovers)
ALTER TABLE scheduled_tasks
  ADD COLUMN IF NOT EXISTS original_scheduled_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN scheduled_tasks.rollover_count IS 'Number of times this task has been postponed to the next day';
COMMENT ON COLUMN scheduled_tasks.original_scheduled_date IS 'Original date the task was first scheduled for (before any rollovers)';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('household_tasks', 'scheduled_tasks')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verify columns were added
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'scheduled_tasks'
  AND column_name IN ('rollover_count', 'original_scheduled_date');

SELECT '✓ Scheduling indexes and columns added successfully!' as status;
