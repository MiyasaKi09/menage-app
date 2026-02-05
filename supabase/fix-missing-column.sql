-- ============================================
-- FIX: Ajouter colonne manquante last_scheduled_at
-- ============================================
-- Le trigger update_next_due_date_on_completion() utilise cette colonne
-- mais elle n'a jamais été créée dans household_tasks

-- 1. Ajouter la colonne manquante
ALTER TABLE household_tasks
ADD COLUMN IF NOT EXISTS last_scheduled_at DATE;

-- 2. Vérifier que la colonne existe maintenant
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'household_tasks'
  AND column_name = 'last_scheduled_at';

-- 3. Message de confirmation
SELECT '✓ Colonne last_scheduled_at ajoutée à household_tasks!' as status;
