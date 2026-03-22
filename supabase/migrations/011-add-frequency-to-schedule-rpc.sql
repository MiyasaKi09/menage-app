-- ============================================
-- MIGRATION 011: Add frequency_code to get_schedule_for_dates
-- Also adds task_type concept for quêtes vs péripéties
-- ============================================

-- Update the RPC to also return frequency_code and household_task_id
CREATE OR REPLACE FUNCTION get_schedule_for_dates(
  p_household_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  scheduled_date DATE,
  task_id UUID,
  household_task_id UUID,
  task_name VARCHAR(100),
  task_tip TEXT,
  category_name VARCHAR(50),
  category_emoji VARCHAR(10),
  duration_minutes INT,
  points INT,
  status VARCHAR(20),
  assigned_to_id UUID,
  assigned_to_name VARCHAR(100),
  rollover_count INT,
  frequency_code VARCHAR(30)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.scheduled_date,
    st.id as task_id,
    st.household_task_id,
    tt.name as task_name,
    tt.tip as task_tip,
    c.name as category_name,
    c.emoji as category_emoji,
    COALESCE(ht.custom_duration_minutes, tt.duration_minutes) as duration_minutes,
    COALESCE(ht.custom_points, tt.base_points) as points,
    st.status,
    st.assigned_to as assigned_to_id,
    p.display_name as assigned_to_name,
    COALESCE(st.rollover_count, 0) as rollover_count,
    f.code as frequency_code
  FROM scheduled_tasks st
  JOIN household_tasks ht ON st.household_task_id = ht.id
  JOIN task_templates tt ON ht.template_id = tt.id
  JOIN categories c ON tt.category_id = c.id
  JOIN frequencies f ON tt.frequency_id = f.id
  LEFT JOIN profiles p ON st.assigned_to = p.id
  WHERE st.household_id = p_household_id
    AND st.scheduled_date BETWEEN p_start_date AND p_end_date
  ORDER BY st.scheduled_date, c.display_order, tt.name;
END;
$$;

COMMENT ON FUNCTION get_schedule_for_dates(UUID, DATE, DATE) IS
  'Retrieve all scheduled tasks for a household within a date range, with full task details including frequency.';

GRANT EXECUTE ON FUNCTION get_schedule_for_dates(UUID, DATE, DATE) TO authenticated;
