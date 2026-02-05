-- ============================================
-- MIGRATION: ADD AUTOMATIC NEXT_DUE_DATE TRIGGER
-- ============================================
-- Date: 2026-02-05
-- Purpose: Automatically calculate next_due_at when a scheduled task is completed

-- ============================================
-- 1. CREATE TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_next_due_date_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_frequency_days INT;
  v_custom_days INT;
  v_final_days INT;
  v_completed_at TIMESTAMPTZ;
BEGIN
  -- Only proceed if task was just marked as completed
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get the completion timestamp (use completed_at if set, otherwise NOW)
  v_completed_at := COALESCE(NEW.completed_at, NOW());

  -- Get frequency configuration for this task
  SELECT
    f.days_default,
    ht.custom_frequency_days
  INTO v_frequency_days, v_custom_days
  FROM household_tasks ht
  JOIN task_templates tt ON ht.template_id = tt.id
  JOIN frequencies f ON tt.frequency_id = f.id
  WHERE ht.id = NEW.household_task_id;

  -- Use custom frequency if set, otherwise use default from frequency table
  v_final_days := COALESCE(v_custom_days, v_frequency_days);

  -- Update the household_tasks table with completion info and next due date
  UPDATE household_tasks
  SET
    last_completed_at = v_completed_at,
    next_due_at = (v_completed_at::DATE + (v_final_days || ' days')::INTERVAL)::DATE,
    last_scheduled_at = NEW.scheduled_date,
    updated_at = NOW()
  WHERE id = NEW.household_task_id;

  -- Log the update (for debugging)
  RAISE NOTICE 'Updated household_task %: next_due_at = % (completed_at + % days)',
    NEW.household_task_id,
    (v_completed_at::DATE + (v_final_days || ' days')::INTERVAL)::DATE,
    v_final_days;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Add comment for documentation
COMMENT ON FUNCTION update_next_due_date_on_completion() IS
  'Automatically updates household_tasks.next_due_at when a scheduled task is completed. Calculates: completed_at + frequency_days = next_due_at';

-- ============================================
-- 2. CREATE TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS trigger_update_next_due_date ON scheduled_tasks;

CREATE TRIGGER trigger_update_next_due_date
  AFTER UPDATE OF status ON scheduled_tasks
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_next_due_date_on_completion();

-- Add comment for documentation
COMMENT ON TRIGGER trigger_update_next_due_date ON scheduled_tasks IS
  'Fires when a scheduled task status changes to completed, automatically calculating the next due date';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify function exists
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as definition_preview
FROM pg_proc
WHERE proname = 'update_next_due_date_on_completion';

-- Verify trigger exists
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_next_due_date'
  AND event_object_table = 'scheduled_tasks';

SELECT '✓ Scheduling trigger created successfully!' as status;
