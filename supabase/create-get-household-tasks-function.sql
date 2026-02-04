-- ============================================
-- CREATE RPC FUNCTION TO GET HOUSEHOLD TASKS
-- ============================================
-- This bypasses Supabase's nested select and uses explicit JOINs

CREATE OR REPLACE FUNCTION get_household_tasks_with_details(p_household_id UUID)
RETURNS TABLE (
  id UUID,
  household_id UUID,
  custom_points INT,
  is_active BOOLEAN,
  template_id UUID,
  template_name VARCHAR(100),
  template_tip TEXT,
  template_base_points INT,
  template_duration_minutes INT,
  category_name VARCHAR(50),
  category_emoji VARCHAR(10)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ht.id,
    ht.household_id,
    ht.custom_points,
    ht.is_active,
    tt.id as template_id,
    tt.name as template_name,
    tt.tip as template_tip,
    tt.base_points as template_base_points,
    tt.duration_minutes as template_duration_minutes,
    c.name as category_name,
    c.emoji as category_emoji
  FROM household_tasks ht
  LEFT JOIN task_templates tt ON ht.template_id = tt.id
  LEFT JOIN categories c ON tt.category_id = c.id
  WHERE ht.household_id = p_household_id
    AND ht.is_active = true
  ORDER BY c.display_order, tt.name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_household_tasks_with_details(UUID) TO authenticated;

SELECT 'Function get_household_tasks_with_details created successfully!' as status;
