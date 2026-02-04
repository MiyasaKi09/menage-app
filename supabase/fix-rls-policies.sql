-- ============================================
-- FIX RLS POLICIES FOR REFERENCE TABLES
-- ============================================
-- Problem: Reference tables (categories, task_templates, etc.) don't have RLS policies
-- This causes Supabase nested selects to fail, returning 0 results
-- Solution: Enable RLS and create permissive SELECT policies for authenticated users

-- Categories (référentiel de catégories)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated SELECT on categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Task Templates (bibliothèque de tâches)
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated SELECT on task_templates"
  ON task_templates FOR SELECT
  TO authenticated
  USING (true);

-- Frequencies (fréquences disponibles)
ALTER TABLE frequencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated SELECT on frequencies"
  ON frequencies FOR SELECT
  TO authenticated
  USING (true);

-- Avatars (avatars disponibles)
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated SELECT on avatars"
  ON avatars FOR SELECT
  TO authenticated
  USING (true);

-- Levels (niveaux du jeu)
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated SELECT on levels"
  ON levels FOR SELECT
  TO authenticated
  USING (true);

-- Achievements (succès disponibles)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated SELECT on achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Motivational Messages (messages de motivation)
ALTER TABLE motivational_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated SELECT on motivational_messages"
  ON motivational_messages FOR SELECT
  TO authenticated
  USING (true);

-- Reward Types (types de récompenses)
ALTER TABLE reward_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view reward types"
  ON reward_types FOR SELECT
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE profile_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script, test the query:
-- SELECT * FROM household_tasks WHERE household_id = 'your-household-id'
--   AND task_templates ( id, name, tip, categories (name, emoji) )
-- This should now return results!

SELECT 'RLS policies created successfully!' as status;
