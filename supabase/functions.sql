-- Fonction pour incrémenter les statistiques du profil
CREATE OR REPLACE FUNCTION increment_profile_stats(
  p_profile_id UUID,
  p_points INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    total_points = total_points + p_points,
    tasks_completed = tasks_completed + 1,
    updated_at = NOW()
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter les statistiques du membre du foyer
CREATE OR REPLACE FUNCTION increment_household_member_stats(
  p_profile_id UUID,
  p_household_id UUID,
  p_points INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE household_members
  SET
    points_in_household = points_in_household + p_points,
    tasks_completed_in_household = tasks_completed_in_household + 1
  WHERE profile_id = p_profile_id AND household_id = p_household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
