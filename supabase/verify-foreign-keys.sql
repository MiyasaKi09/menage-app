-- ============================================
-- VERIFY AND FIX FOREIGN KEY CONSTRAINTS
-- ============================================
-- Check if foreign keys exist and recreate if needed

-- 1. Check existing foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('household_tasks', 'task_templates')
ORDER BY tc.table_name, kcu.column_name;

-- 2. If foreign keys don't exist, create them
-- Drop existing constraints if they exist (in case they're broken)
ALTER TABLE household_tasks DROP CONSTRAINT IF EXISTS household_tasks_template_id_fkey;
ALTER TABLE task_templates DROP CONSTRAINT IF EXISTS task_templates_category_id_fkey;

-- Recreate the foreign keys
ALTER TABLE household_tasks
  ADD CONSTRAINT household_tasks_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES task_templates(id);

ALTER TABLE task_templates
  ADD CONSTRAINT task_templates_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 3. Verify the constraints were created
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('household_tasks', 'task_templates')
ORDER BY tc.table_name, kcu.column_name;

SELECT 'Foreign key constraints verified and recreated!' as status;
