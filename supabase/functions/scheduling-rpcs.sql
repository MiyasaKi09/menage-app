-- ============================================
-- RPC FUNCTIONS FOR TASK SCHEDULING SYSTEM
-- ============================================
-- Date: 2026-02-05
-- Purpose: Core scheduling logic for daily task planning

-- ============================================
-- FUNCTION 1: INITIALIZE TASK DUE DATES
-- ============================================
-- One-time initialization for existing tasks

CREATE OR REPLACE FUNCTION initialize_task_due_dates(
  p_household_id UUID
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Calculate next_due_at for all tasks that don't have it set
  UPDATE household_tasks ht
  SET next_due_at = COALESCE(
    -- If completed before: last_completed + frequency_days
    (ht.last_completed_at::DATE + (COALESCE(ht.custom_frequency_days, f.days_default) || ' days')::INTERVAL)::DATE,
    -- If never completed: due today
    CURRENT_DATE
  ),
  updated_at = NOW()
  FROM task_templates tt
  JOIN frequencies f ON tt.frequency_id = f.id
  WHERE ht.household_id = p_household_id
    AND ht.is_active = true
    AND ht.next_due_at IS NULL
    AND ht.template_id = tt.id;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RAISE NOTICE 'Initialized % tasks with next_due_at for household %', v_count, p_household_id;

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION initialize_task_due_dates(UUID) IS
  'Initialize next_due_at for all tasks in a household. Run once during migration.';

-- ============================================
-- FUNCTION 2: GENERATE DAILY SCHEDULE
-- ============================================
-- Main scheduler: selects tasks for a specific date

CREATE OR REPLACE FUNCTION generate_daily_schedule(
  p_household_id UUID,
  p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available_minutes INT;
  v_flexible_minutes INT;
  v_total_minutes INT := 0;
  v_task_count INT := 0;
  v_task RECORD;
BEGIN
  -- 1. Get available minutes from questionnaire (default 60 if not set)
  SELECT COALESCE(pq.available_minutes_daily, 60)
  INTO v_available_minutes
  FROM household_members hm
  LEFT JOIN profile_questionnaire pq ON hm.profile_id = pq.profile_id
  WHERE hm.household_id = p_household_id
  LIMIT 1;

  -- Apply 15% flexibility buffer
  v_flexible_minutes := FLOOR(v_available_minutes * 1.15);

  -- 2. Initialize next_due_at for tasks that don't have it
  UPDATE household_tasks ht
  SET next_due_at = COALESCE(
    (ht.last_completed_at::DATE + (COALESCE(ht.custom_frequency_days, f.days_default) || ' days')::INTERVAL)::DATE,
    p_target_date
  ),
  updated_at = NOW()
  FROM task_templates tt
  JOIN frequencies f ON tt.frequency_id = f.id
  WHERE ht.household_id = p_household_id
    AND ht.is_active = true
    AND ht.next_due_at IS NULL
    AND ht.template_id = tt.id;

  -- 3. Select and schedule tasks based on priority
  FOR v_task IN (
    SELECT
      ht.id as household_task_id,
      ht.household_id,
      ht.next_due_at,
      ht.preferred_assignee_id,
      COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as duration,
      COALESCE(ht.custom_points, tt.base_points) as points,
      -- Priority scoring
      CASE
        -- Overdue: 1000 base + 50 per day overdue
        WHEN ht.next_due_at < p_target_date THEN
          1000 + ((p_target_date::date - ht.next_due_at::date) * 50)
        -- Due today: 500 base + urgency factor from frequency
        WHEN ht.next_due_at = p_target_date THEN
          500 + (10 - LEAST(f.days_default / 7, 10))::INT
        -- Future: don't schedule yet
        ELSE 0
      END as priority
    FROM household_tasks ht
    JOIN task_templates tt ON ht.template_id = tt.id
    JOIN frequencies f ON tt.frequency_id = f.id
    WHERE ht.household_id = p_household_id
      AND ht.is_active = true
      AND ht.next_due_at <= p_target_date
      AND NOT EXISTS (
        -- Don't schedule if already scheduled for this date
        SELECT 1 FROM scheduled_tasks st
        WHERE st.household_task_id = ht.id
          AND st.scheduled_date = p_target_date
          AND st.status IN ('pending', 'in_progress', 'completed')
      )
    ORDER BY priority DESC, duration ASC -- High priority first, then short tasks
  ) LOOP
    -- Check if task fits in time budget
    IF v_total_minutes + v_task.duration <= v_flexible_minutes THEN
      -- Schedule this task
      INSERT INTO scheduled_tasks (
        household_task_id,
        household_id,
        scheduled_date,
        status,
        assigned_to,
        created_at,
        updated_at
      ) VALUES (
        v_task.household_task_id,
        v_task.household_id,
        p_target_date,
        'pending',
        v_task.preferred_assignee_id,
        NOW(),
        NOW()
      );

      v_total_minutes := v_total_minutes + v_task.duration;
      v_task_count := v_task_count + 1;
    ELSIF v_task.priority >= 1000 AND v_total_minutes + v_task.duration <= (v_available_minutes * 1.20) THEN
      -- Allow up to 20% overflow for overdue tasks only
      INSERT INTO scheduled_tasks (
        household_task_id,
        household_id,
        scheduled_date,
        status,
        assigned_to,
        created_at,
        updated_at
      ) VALUES (
        v_task.household_task_id,
        v_task.household_id,
        p_target_date,
        'pending',
        v_task.preferred_assignee_id,
        NOW(),
        NOW()
      );

      v_total_minutes := v_total_minutes + v_task.duration;
      v_task_count := v_task_count + 1;
    END IF;
  END LOOP;

  -- Return summary
  RETURN jsonb_build_object(
    'success', true,
    'tasks_scheduled', v_task_count,
    'total_minutes', v_total_minutes,
    'available_minutes', v_available_minutes,
    'overflow_used', v_total_minutes > v_available_minutes,
    'target_date', p_target_date
  );
END;
$$;

COMMENT ON FUNCTION generate_daily_schedule(UUID, DATE) IS
  'Generate daily task schedule for a household, respecting time budget and prioritizing overdue tasks.';

-- ============================================
-- FUNCTION 3: GET SCHEDULE FOR DATE RANGE
-- ============================================
-- Retrieve scheduled tasks with full details

CREATE OR REPLACE FUNCTION get_schedule_for_dates(
  p_household_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  scheduled_date DATE,
  task_id UUID,
  task_name VARCHAR(100),
  task_tip TEXT,
  category_name VARCHAR(50),
  category_emoji VARCHAR(10),
  duration_minutes INT,
  points INT,
  status VARCHAR(20),
  assigned_to_id UUID,
  assigned_to_name VARCHAR(100),
  rollover_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.scheduled_date,
    st.id as task_id,
    tt.name as task_name,
    tt.tip as task_tip,
    c.name as category_name,
    c.emoji as category_emoji,
    COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as duration_minutes,
    COALESCE(ht.custom_points, tt.base_points) as points,
    st.status,
    st.assigned_to as assigned_to_id,
    p.display_name as assigned_to_name,
    COALESCE(st.rollover_count, 0) as rollover_count
  FROM scheduled_tasks st
  JOIN household_tasks ht ON st.household_task_id = ht.id
  JOIN task_templates tt ON ht.template_id = tt.id
  JOIN categories c ON tt.category_id = c.id
  LEFT JOIN profiles p ON st.assigned_to = p.id
  WHERE st.household_id = p_household_id
    AND st.scheduled_date BETWEEN p_start_date AND p_end_date
  ORDER BY st.scheduled_date, c.display_order, tt.name;
END;
$$;

COMMENT ON FUNCTION get_schedule_for_dates(UUID, DATE, DATE) IS
  'Retrieve all scheduled tasks for a household within a date range, with full task details.';

-- ============================================
-- FUNCTION 4: HANDLE LATE TASKS
-- ============================================
-- Manage tasks that weren't completed (rollover or skip)

CREATE OR REPLACE FUNCTION handle_late_tasks(
  p_household_id UUID,
  p_current_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_skipped_count INT := 0;
  v_rolled_count INT := 0;
BEGIN
  -- Mark daily tasks as skipped (can't postpone daily tasks forever)
  UPDATE scheduled_tasks
  SET
    status = 'skipped',
    updated_at = NOW()
  FROM household_tasks ht
  JOIN task_templates tt ON ht.template_id = tt.id
  JOIN frequencies f ON tt.frequency_id = f.id
  WHERE scheduled_tasks.household_task_id = ht.id
    AND scheduled_tasks.household_id = p_household_id
    AND scheduled_tasks.scheduled_date = p_current_date
    AND scheduled_tasks.status = 'pending'
    AND f.code = 'daily';

  GET DIAGNOSTICS v_skipped_count = ROW_COUNT;

  -- Roll over non-daily tasks to tomorrow
  UPDATE scheduled_tasks
  SET
    scheduled_date = p_current_date + INTERVAL '1 day',
    rollover_count = COALESCE(rollover_count, 0) + 1,
    original_scheduled_date = COALESCE(original_scheduled_date, scheduled_date),
    updated_at = NOW()
  FROM household_tasks ht
  JOIN task_templates tt ON ht.template_id = tt.id
  JOIN frequencies f ON tt.frequency_id = f.id
  WHERE scheduled_tasks.household_task_id = ht.id
    AND scheduled_tasks.household_id = p_household_id
    AND scheduled_tasks.scheduled_date = p_current_date
    AND scheduled_tasks.status = 'pending'
    AND f.code != 'daily'
    AND COALESCE(scheduled_tasks.rollover_count, 0) < 3; -- Limit to 3 rollovers

  GET DIAGNOSTICS v_rolled_count = ROW_COUNT;

  -- Tasks rolled over 3+ times: mark as skipped and let scheduler reschedule fresh
  UPDATE scheduled_tasks
  SET
    status = 'skipped',
    updated_at = NOW()
  WHERE scheduled_tasks.household_id = p_household_id
    AND scheduled_tasks.scheduled_date = p_current_date
    AND scheduled_tasks.status = 'pending'
    AND COALESCE(scheduled_tasks.rollover_count, 0) >= 3;

  RAISE NOTICE 'Late tasks handled: % skipped, % rolled over', v_skipped_count, v_rolled_count;

  RETURN jsonb_build_object(
    'success', true,
    'skipped_tasks', v_skipped_count,
    'rolled_over_tasks', v_rolled_count,
    'current_date', p_current_date
  );
END;
$$;

COMMENT ON FUNCTION handle_late_tasks(UUID, DATE) IS
  'Handle incomplete tasks from a specific date: skip daily tasks, roll over others (max 3 times).';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION initialize_task_due_dates(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_daily_schedule(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_schedule_for_dates(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_late_tasks(UUID, DATE) TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT
  proname as function_name,
  pronargs as num_args,
  pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname IN (
  'initialize_task_due_dates',
  'generate_daily_schedule',
  'get_schedule_for_dates',
  'handle_late_tasks'
)
ORDER BY proname;

SELECT '✓ All 4 scheduling RPC functions created successfully!' as status;
