-- ============================================================
-- FIX v2: Mise a jour COMPLETE des personnages (8 personnages)
-- Execute ce script ENTIER dans le SQL Editor de Supabase
-- ============================================================

-- STEP 1: Drop les anciennes fonctions
DROP FUNCTION IF EXISTS assign_weekly_character(uuid, uuid);
DROP FUNCTION IF EXISTS get_character_collection(uuid);
DROP FUNCTION IF EXISTS reveal_weekly_character(uuid);

-- STEP 2: Ajouter les colonnes si manquantes
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS rarity VARCHAR(20) DEFAULT 'common';
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS character_class VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS color_theme JSONB;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS power_type VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS power_description TEXT;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS power_value JSONB;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS lore_text TEXT;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS is_weekly_eligible BOOLEAN DEFAULT TRUE;

-- STEP 3: Creer les tables si manquantes
CREATE TABLE IF NOT EXISTS weekly_characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    avatar_id UUID REFERENCES avatars(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    is_revealed BOOLEAN DEFAULT FALSE,
    revealed_at TIMESTAMPTZ,
    power_uses_remaining INT DEFAULT -1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, profile_id, week_start)
);
CREATE INDEX IF NOT EXISTS idx_weekly_characters_active ON weekly_characters(household_id, week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_characters_profile ON weekly_characters(profile_id, week_start DESC);

CREATE TABLE IF NOT EXISTS character_collection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    avatar_id UUID REFERENCES avatars(id) ON DELETE CASCADE,
    first_received_at TIMESTAMPTZ DEFAULT NOW(),
    times_received INT DEFAULT 1,
    is_favorite BOOLEAN DEFAULT FALSE,
    UNIQUE(profile_id, avatar_id)
);
CREATE INDEX IF NOT EXISTS idx_character_collection_profile ON character_collection(profile_id);

-- STEP 4: RLS
ALTER TABLE weekly_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_collection ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_characters' AND policyname = 'Members can view weekly characters') THEN
        CREATE POLICY "Members can view weekly characters" ON weekly_characters FOR SELECT USING (household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_characters' AND policyname = 'Users can manage own weekly characters') THEN
        CREATE POLICY "Users can manage own weekly characters" ON weekly_characters FOR ALL USING (profile_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'character_collection' AND policyname = 'Users can view own collection') THEN
        CREATE POLICY "Users can view own collection" ON character_collection FOR SELECT USING (profile_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'character_collection' AND policyname = 'Users can manage own collection') THEN
        CREATE POLICY "Users can manage own collection" ON character_collection FOR ALL USING (profile_id = auth.uid());
    END IF;
END $$;

-- STEP 5: Nettoyer les anciennes donnees
UPDATE profiles SET avatar_id = NULL;
TRUNCATE weekly_characters CASCADE;
TRUNCATE character_collection CASCADE;
TRUNCATE avatars CASCADE;

-- STEP 6: Inserer les 8 personnages
INSERT INTO avatars (name, description, character_class, rarity, color_theme, power_type, power_description, power_value, lore_text, unlock_type, is_weekly_eligible) VALUES
(
    'Capitaine Recure',
    'Un pirate dont le navire est toujours impeccable',
    'pirate',
    'rare',
    '{"primary": "176 112 96", "accent": "200 139 122", "glow": "232 184 168"}',
    'point_multiplier',
    'x1.25 sur tout lor gagne',
    '{"multiplier": 1.25}',
    'Le pont de son navire brille plus que lor de sa cale. Ses moussaillons recurrent le pont en chantant.',
    'free',
    true
),
(
    'Dame Blanche la Lavandiere',
    'La lavandiere qui fait briller le linge',
    'lavandiere',
    'common',
    '{"primary": "74 122 115", "accent": "107 143 136", "glow": "168 200 195"}',
    'category_bonus',
    '+20% or sur les quetes Textile',
    '{"category": "Textile", "bonus_percent": 20}',
    'On dit que meme les draps royaux passent entre ses mains. Le linge seche deux fois plus vite quand elle chante.',
    'free',
    true
),
(
    'Merlin le Propre',
    'Un mage obsede par la proprete magique',
    'mage',
    'rare',
    '{"primary": "155 140 181", "accent": "181 160 200", "glow": "212 200 232"}',
    'category_bonus',
    '+20% or sur les quetes Sanitaire',
    '{"category": "Sanitaire", "bonus_percent": 20}',
    'Ses sorts de nettoyage sont legendaires dans tout le royaume. On dit que sa barbe reste immaculee malgre ses potions fumantes.',
    'free',
    true
),
(
    'Barde des Prairies',
    'Une musicienne errante dont les chants allegent le labeur',
    'boheme',
    'common',
    '{"primary": "195 150 150", "accent": "215 175 170", "glow": "235 205 200"}',
    'time_reduction',
    '-3 min sur toutes les quetes',
    '{"reduction_minutes": 3, "min_duration": 10}',
    'Pieds nus dans lherbe, son tambourin rythme les gestes du menage. Quand elle joue, le temps semble ralentir.',
    'free',
    true
),
(
    'Oracle des Saules',
    'Un mystique qui voit la crasse avant quelle napparaisse',
    'devin',
    'rare',
    '{"primary": "85 95 115", "accent": "115 125 145", "glow": "165 175 195"}',
    'streak_shield',
    'Protege votre serie 2 fois cette semaine',
    '{"shield_count": 2}',
    'Ses yeux voient au-dela du visible. Il predit les taches avant quelles ne simposent et guide les ames vers lordre.',
    'free',
    true
),
(
    'Imperatrice des Roses',
    'Une noble dame dont les jardins sont legendaires',
    'imperatrice',
    'epic',
    '{"primary": "60 90 55", "accent": "90 128 80", "glow": "140 180 130"}',
    'category_bonus',
    '+25% or sur les quetes Exterieur & Plantes',
    '{"category": "Extérieur & Plantes", "bonus_percent": 25}',
    'Ses rosiers fleurissent meme en hiver. On dit que les epines se plient sur son passage et que les petales chantent a laube.',
    'level',
    true
),
(
    'Sentinelle du Chateau',
    'Un garde vigilant qui protege lordre du foyer',
    'sentinelle',
    'common',
    '{"primary": "178 145 72", "accent": "196 163 90", "glow": "220 200 140"}',
    'category_bonus',
    '+20% or sur les quetes Rangement',
    '{"category": "Rangement", "bonus_percent": 20}',
    'Rien nechappe a sa vigilance. Chaque objet a sa place, chaque porte est verrouillee. Le desordre est son ennemi jure.',
    'free',
    true
),
(
    'Ange Celeste',
    'Un ange aux ailes dorees qui purifie les espaces',
    'ange',
    'legendary',
    '{"primary": "212 195 130", "accent": "230 215 160", "glow": "245 235 200"}',
    'point_multiplier',
    'x1.5 sur tout lor gagne cette semaine',
    '{"multiplier": 1.5}',
    'Ses plumes dorees tombent la ou la lumiere touche la poussiere. Chaque piece quelle visite devient un sanctuaire de purete.',
    'level',
    true
);

-- STEP 7: Recreer les fonctions RPC

-- Assigner un personnage hebdomadaire
CREATE OR REPLACE FUNCTION assign_weekly_character(p_household_id UUID, p_profile_id UUID)
RETURNS TABLE(out_weekly_id UUID, out_avatar_id UUID, out_avatar_name TEXT, out_description TEXT, out_character_class VARCHAR, out_rarity VARCHAR, out_color_theme JSONB, out_power_type VARCHAR, out_power_description TEXT, out_power_value JSONB, out_lore_text TEXT, out_is_revealed BOOLEAN)
AS $$
DECLARE v_week_start DATE; v_week_end DATE; v_existing_id UUID; v_avatar_id UUID;
BEGIN
    v_week_start := date_trunc('week', CURRENT_DATE)::date;
    v_week_end := v_week_start + 6;

    -- Verifier si deja assigne cette semaine
    SELECT wc.id, wc.avatar_id INTO v_existing_id, v_avatar_id
    FROM weekly_characters wc
    WHERE wc.household_id = p_household_id AND wc.profile_id = p_profile_id AND wc.week_start = v_week_start;

    IF v_existing_id IS NOT NULL THEN
        RETURN QUERY
        SELECT wc.id, a.id, a.name::TEXT, a.description::TEXT, a.character_class, a.rarity, a.color_theme, a.power_type, a.power_description, a.power_value, a.lore_text, wc.is_revealed
        FROM weekly_characters wc JOIN avatars a ON a.id = wc.avatar_id
        WHERE wc.id = v_existing_id;
        RETURN;
    END IF;

    -- Selection aleatoire ponderee par rarete
    SELECT a.id INTO v_avatar_id FROM avatars a
    WHERE a.is_weekly_eligible = true
    ORDER BY CASE a.rarity
        WHEN 'legendary' THEN random() * 0.05
        WHEN 'epic' THEN random() * 0.15
        WHEN 'rare' THEN random() * 0.30
        WHEN 'common' THEN random() * 0.50
    END DESC
    LIMIT 1;

    -- Inserer l'assignation
    INSERT INTO weekly_characters (household_id, profile_id, avatar_id, week_start, week_end)
    VALUES (p_household_id, p_profile_id, v_avatar_id, v_week_start, v_week_end);

    -- Ajouter a la collection
    INSERT INTO character_collection (profile_id, avatar_id)
    VALUES (p_profile_id, v_avatar_id)
    ON CONFLICT (profile_id, avatar_id)
    DO UPDATE SET times_received = character_collection.times_received + 1;

    -- Retourner la nouvelle assignation
    RETURN QUERY
    SELECT wc.id, a.id, a.name::TEXT, a.description::TEXT, a.character_class, a.rarity, a.color_theme, a.power_type, a.power_description, a.power_value, a.lore_text, wc.is_revealed
    FROM weekly_characters wc JOIN avatars a ON a.id = wc.avatar_id
    WHERE wc.household_id = p_household_id AND wc.profile_id = p_profile_id AND wc.week_start = v_week_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reveler le personnage
CREATE OR REPLACE FUNCTION reveal_weekly_character(p_weekly_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE weekly_characters SET is_revealed = true, revealed_at = NOW()
    WHERE id = p_weekly_id AND profile_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Collection de personnages
CREATE OR REPLACE FUNCTION get_character_collection(p_profile_id UUID)
RETURNS TABLE(out_avatar_id UUID, out_avatar_name TEXT, out_description TEXT, out_character_class VARCHAR, out_rarity VARCHAR, out_color_theme JSONB, out_power_type VARCHAR, out_power_description TEXT, out_power_value JSONB, out_lore_text TEXT, out_times_received INT, out_is_favorite BOOLEAN, out_is_collected BOOLEAN)
AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.name::TEXT, a.description::TEXT, a.character_class, a.rarity, a.color_theme, a.power_type, a.power_description, a.power_value, a.lore_text,
           COALESCE(cc.times_received, 0), COALESCE(cc.is_favorite, false), cc.id IS NOT NULL
    FROM avatars a
    LEFT JOIN character_collection cc ON cc.avatar_id = a.id AND cc.profile_id = p_profile_id
    WHERE a.is_weekly_eligible = true
    ORDER BY CASE WHEN cc.id IS NOT NULL THEN 0 ELSE 1 END,
             CASE a.rarity WHEN 'legendary' THEN 0 WHEN 'epic' THEN 1 WHEN 'rare' THEN 2 WHEN 'common' THEN 3 END,
             a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 8: Accorder les permissions aux utilisateurs authentifies
GRANT EXECUTE ON FUNCTION assign_weekly_character(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reveal_weekly_character(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_character_collection(UUID) TO authenticated;

-- STEP 9: Ajouter policy DELETE sur households (manquante!)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'households' AND policyname = 'Admins can delete their households') THEN
        CREATE POLICY "Admins can delete their households" ON households FOR DELETE USING (
            id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- STEP 10: Verification
SELECT name, character_class, rarity FROM avatars ORDER BY name;
