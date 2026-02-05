-- ============================================
-- Migration 004: Étendre questionnaire_responses
-- ============================================
-- Ajouter les nouvelles colonnes pour capturer 97 conditions

-- D'abord vérifier si la table existe, sinon créer une table temporaire
DO $$
BEGIN
  -- Vérifier si la table profile_questionnaire existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profile_questionnaire') THEN

    -- HOUSING - Pièces spéciales
    ALTER TABLE profile_questionnaire
    ADD COLUMN IF NOT EXISTS has_stairs BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_fireplace BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_dressing BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_office BOOLEAN DEFAULT FALSE;

    -- KITCHEN - Équipements (multi-select stocké en array)
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

    -- ANIMALS - Types d'animaux (remplace has_pets boolean)
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

    RAISE NOTICE 'Colonnes ajoutées à profile_questionnaire';
  ELSE
    RAISE NOTICE 'Table profile_questionnaire non trouvée, vérifier le nom de la table';
  END IF;
END $$;

-- Commentaires explicatifs
COMMENT ON COLUMN profile_questionnaire.kitchen_equipment IS 'Array: toaster, food_processor, thermomix, plancha_bbq, compost, pantry, dishwasher, oven, microwave, hood, freezer';
COMMENT ON COLUMN profile_questionnaire.bathroom_features IS 'Array: shower_door, shower_curtain, bidet, bath_mat, bathtub';
COMMENT ON COLUMN profile_questionnaire.robots IS 'Array: vacuum, mop, self_empty, window, lawn_mower';
COMMENT ON COLUMN profile_questionnaire.animals IS 'Array: cat, dog, aquarium, rodent_bird, reptile';
COMMENT ON COLUMN profile_questionnaire.outdoor_features IS 'Array: lawn, hedges, gutters, bbq, pool, jacuzzi, garage, vegetable_garden, garden_furniture, garden_shed';
