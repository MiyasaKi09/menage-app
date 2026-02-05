-- ============================================
-- SCRIPT CONSOLIDÉ - TOUTES LES MIGRATIONS
-- ============================================
-- Exécuter ce script en UNE SEULE FOIS dans Supabase SQL Editor
-- Ordre: 001 → 002 → 003 → 004 → seed-task-templates-v3

-- ============================================
-- MIGRATION 001: Ajouter condition_code à task_templates
-- ============================================
ALTER TABLE task_templates
ADD COLUMN IF NOT EXISTS condition_code VARCHAR(50);

ALTER TABLE task_templates
ADD COLUMN IF NOT EXISTS needs_product BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_task_templates_condition
ON task_templates(condition_code);

COMMENT ON COLUMN task_templates.condition_code IS 'Code de condition du questionnaire (ex: grille_pain, robot_aspirateur)';
COMMENT ON COLUMN task_templates.needs_product IS 'Indique si la tâche nécessite un produit ménager';

-- ============================================
-- MIGRATION 002: Ajouter 3 nouvelles catégories
-- ============================================
INSERT INTO categories (name, emoji, description, display_order)
VALUES
  ('Robots', '🤖', 'Maintenance des robots ménagers (aspirateur, laveur, tondeuse)', 12),
  ('Bureau', '💼', 'Espace de travail, ordinateur, organisation', 13),
  ('Colocation', '👥', 'Tâches spécifiques à la vie en colocation', 14)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- ============================================
-- MIGRATION 003: Ajouter 2 nouvelles fréquences
-- ============================================
INSERT INTO frequencies (code, label, days_min, days_max, days_default)
VALUES
  ('after_use', 'Après usage', 0, 1, 1),
  ('if_needed', 'Si besoin', 0, 365, 30)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  days_min = EXCLUDED.days_min,
  days_max = EXCLUDED.days_max,
  days_default = EXCLUDED.days_default;

-- S'assurer que toutes les fréquences standard existent
INSERT INTO frequencies (code, label, days_min, days_max, days_default)
VALUES
  ('daily', 'Quotidien', 1, 1, 1),
  ('2-3x_week', '2-3 fois par semaine', 2, 4, 3),
  ('weekly', 'Hebdomadaire', 7, 7, 7),
  ('biweekly', 'Toutes les 2 semaines', 14, 14, 14),
  ('monthly', 'Mensuel', 28, 31, 30),
  ('quarterly', 'Trimestriel', 84, 92, 90),
  ('biannual', 'Semestriel', 168, 184, 180),
  ('annual', 'Annuel', 350, 380, 365),
  ('seasonal', 'Saisonnier', 80, 100, 90)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- MIGRATION 004: Étendre profile_questionnaire
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profile_questionnaire') THEN
    -- HOUSING - Pièces spéciales
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS has_stairs BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_fireplace BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_dressing BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_office BOOLEAN DEFAULT FALSE;

    -- KITCHEN - Équipements
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS kitchen_equipment TEXT[] DEFAULT '{}';

    -- BATHROOM - Caractéristiques
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS bathroom_features TEXT[] DEFAULT '{}';

    -- LAUNDRY - Équipements
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS laundry_features TEXT[] DEFAULT '{}';

    -- FURNITURE - Types de mobilier
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS furniture_types TEXT[] DEFAULT '{}';

    -- ROBOTS - Types de robots
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS robots TEXT[] DEFAULT '{}';

    -- OUTDOOR - Caractéristiques extérieures
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS outdoor_features TEXT[] DEFAULT '{}';

    -- ANIMALS - Types d'animaux
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS animals TEXT[] DEFAULT '{}';

    -- CHILDREN - Détails enfants
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS has_baby BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS children_play_outside BOOLEAN DEFAULT FALSE;

    -- LIFESTYLE
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS is_shared_housing BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS works_from_home BOOLEAN DEFAULT FALSE;

    -- ENVIRONMENT
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS high_dust_area BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS high_pollen_area BOOLEAN DEFAULT FALSE;

    RAISE NOTICE '✓ Migration 004: profile_questionnaire étendu';
  ELSE
    RAISE NOTICE '⚠ Table profile_questionnaire non trouvée - création ignorée';
  END IF;
END $$;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================
DO $$
DECLARE
  cat_count INT;
  freq_count INT;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO freq_count FROM frequencies;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATIONS TERMINÉES';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Catégories: % (attendu: 14)', cat_count;
  RAISE NOTICE 'Fréquences: % (attendu: 11)', freq_count;
  RAISE NOTICE '';
  RAISE NOTICE 'ÉTAPE SUIVANTE:';
  RAISE NOTICE 'Exécuter seed-task-templates-v3.sql pour insérer les 227 tâches';
  RAISE NOTICE '========================================';
END $$;
