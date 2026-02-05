-- ============================================
-- DEBUG: VERIFICATION DES PERMISSIONS DE COMPLETION
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor pour diagnostiquer

-- 1. Vérifier les policies RLS sur scheduled_tasks
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'scheduled_tasks';

-- 2. Vérifier les policies RLS sur task_history
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'task_history';

-- 3. Vérifier qu'il y a des scheduled_tasks pour aujourd'hui
SELECT
  st.id,
  st.scheduled_date,
  st.status,
  st.household_id,
  tt.name as task_name
FROM scheduled_tasks st
JOIN household_tasks ht ON st.household_task_id = ht.id
JOIN task_templates tt ON ht.template_id = tt.id
WHERE st.scheduled_date = CURRENT_DATE
LIMIT 10;

-- 4. Vérifier les colonnes de scheduled_tasks
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'scheduled_tasks'
ORDER BY ordinal_position;

-- 5. Vérifier les colonnes de task_history
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'task_history'
ORDER BY ordinal_position;

-- ============================================
-- FIX: Si les policies sont manquantes
-- ============================================

-- Assurer que RLS est activé
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Members can view scheduled tasks" ON scheduled_tasks;
DROP POLICY IF EXISTS "Members can manage scheduled tasks" ON scheduled_tasks;
DROP POLICY IF EXISTS "Members can view task history" ON task_history;
DROP POLICY IF EXISTS "System can insert task history" ON task_history;

-- Recréer les policies pour scheduled_tasks
CREATE POLICY "Members can view scheduled tasks"
ON scheduled_tasks FOR SELECT
USING (
  household_id IN (
    SELECT household_id FROM household_members WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Members can update scheduled tasks"
ON scheduled_tasks FOR UPDATE
USING (
  household_id IN (
    SELECT household_id FROM household_members WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Members can insert scheduled tasks"
ON scheduled_tasks FOR INSERT
WITH CHECK (
  household_id IN (
    SELECT household_id FROM household_members WHERE profile_id = auth.uid()
  )
);

-- Recréer les policies pour task_history
CREATE POLICY "Members can view task history"
ON task_history FOR SELECT
USING (
  household_id IN (
    SELECT household_id FROM household_members WHERE profile_id = auth.uid()
  )
  OR profile_id = auth.uid()
);

CREATE POLICY "Members can insert task history"
ON task_history FOR INSERT
WITH CHECK (
  profile_id = auth.uid()
  AND household_id IN (
    SELECT household_id FROM household_members WHERE profile_id = auth.uid()
  )
);

-- ============================================
-- VERIFICATION FINALE
-- ============================================
SELECT 'Policies recréées avec succès!' as status;

-- Lister toutes les policies après correction
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('scheduled_tasks', 'task_history')
ORDER BY tablename, policyname;
