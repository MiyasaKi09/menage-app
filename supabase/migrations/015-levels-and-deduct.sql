-- =============================================
-- Migration 015: Auto-update level + deduct_points
-- =============================================

-- 1. Trigger: auto-update current_level when total_points changes
CREATE OR REPLACE FUNCTION auto_update_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_points IS DISTINCT FROM OLD.total_points THEN
    NEW.current_level := COALESCE(
      (SELECT level FROM levels WHERE points_required <= NEW.total_points ORDER BY level DESC LIMIT 1),
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_update_level ON profiles;
CREATE TRIGGER trigger_auto_update_level
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_level();

-- 2. Backfill existing profiles
UPDATE profiles SET current_level = COALESCE(
  (SELECT level FROM levels WHERE points_required <= profiles.total_points ORDER BY level DESC LIMIT 1),
  1
);

-- 3. RPC: deduct points (returns false if insufficient)
CREATE OR REPLACE FUNCTION deduct_points(p_profile_id UUID, p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_pts INTEGER;
BEGIN
  SELECT total_points INTO current_pts FROM profiles WHERE id = p_profile_id;
  IF current_pts IS NULL OR current_pts < p_amount THEN
    RETURN FALSE;
  END IF;
  UPDATE profiles SET total_points = total_points - p_amount WHERE id = p_profile_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
