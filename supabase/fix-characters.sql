-- ============================================================
-- FIX: Complete character setup (run this in Supabase SQL Editor)
-- This script is idempotent - safe to run multiple times
-- ============================================================

-- 1. Add missing columns to avatars table
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS rarity VARCHAR(20) DEFAULT 'common';
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS character_class VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS color_theme JSONB;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS power_type VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS power_description TEXT;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS power_value JSONB;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS lore_text TEXT;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS is_weekly_eligible BOOLEAN DEFAULT TRUE;

-- 2. Create weekly_characters table
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

-- 3. Create character_collection table
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

-- 4. RLS
ALTER TABLE weekly_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_collection ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_characters' AND policyname = 'Members can view weekly characters') THEN
        CREATE POLICY "Members can view weekly characters" ON weekly_characters
            FOR SELECT USING (household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_characters' AND policyname = 'Users can manage own weekly characters') THEN
        CREATE POLICY "Users can manage own weekly characters" ON weekly_characters
            FOR ALL USING (profile_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'character_collection' AND policyname = 'Users can view own collection') THEN
        CREATE POLICY "Users can view own collection" ON character_collection
            FOR SELECT USING (profile_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'character_collection' AND policyname = 'Users can manage own collection') THEN
        CREATE POLICY "Users can manage own collection" ON character_collection
            FOR ALL USING (profile_id = auth.uid());
    END IF;
END $$;

-- 5. Clear and re-seed avatars
DELETE FROM avatars;

INSERT INTO avatars (name, description, character_class, rarity, color_theme, power_type, power_description, power_value, lore_text, unlock_type, is_weekly_eligible) VALUES
('Merlin le Propre', 'Un sorcier obsede par la proprete magique', 'wizard', 'rare',
 '{"primary": "155 140 181", "accent": "181 160 200", "glow": "212 200 232"}',
 'category_bonus', '+20% or sur les quetes Sanitaire', '{"category": "Sanitaire", "bonus_percent": 20}',
 'Ses sorts de nettoyage sont legendaires dans tout le royaume.', 'free', true),

('Dame Blanche la Lavandiere', 'La lavandiere qui fait briller le linge', 'washerwoman', 'common',
 '{"primary": "74 122 115", "accent": "107 143 136", "glow": "168 200 195"}',
 'category_bonus', '+20% or sur les quetes Textile', '{"category": "Textile", "bonus_percent": 20}',
 'On dit que meme les draps royaux passent entre ses mains.', 'free', true),

('Capitaine Recure', 'Un pirate dont le navire est toujours impeccable', 'pirate', 'rare',
 '{"primary": "176 112 96", "accent": "200 139 122", "glow": "232 184 168"}',
 'point_multiplier', 'x1.25 sur tout lor gagne', '{"multiplier": 1.25}',
 'Le pont de son navire brille plus que lor de sa cale.', 'free', true),

('Chevalier Etincelant', 'Un chevalier dont armure est un miroir', 'knight', 'common',
 '{"primary": "196 163 90", "accent": "212 183 106", "glow": "240 224 160"}',
 'category_bonus', '+20% or sur les quetes Sols & Surfaces', '{"category": "Sols & Surfaces", "bonus_percent": 20}',
 'Son armure est si polie quon peut y voir son reflet.', 'free', true),

('Fee du Logis', 'Une fee dont la baguette transforme le desordre en ordre', 'fairy', 'epic',
 '{"primary": "90 128 96", "accent": "123 155 123", "glow": "176 216 176"}',
 'category_bonus', '+20% or sur les quetes Rangement', '{"category": "Rangement", "bonus_percent": 20}',
 'Un coup de baguette et tout se range comme par magie.', 'level', true),

('Alchimiste des Saveurs', 'Un alchimiste transformant les restes en festins', 'alchemist', 'rare',
 '{"primary": "200 139 122", "accent": "212 160 144", "glow": "240 200 184"}',
 'category_bonus', '+20% or sur les quetes Cuisine & Vaisselle', '{"category": "Cuisine & Vaisselle", "bonus_percent": 20}',
 'Sa cuisine est un laboratoire ou tout ingredient devient or.', 'free', true),

('Druide des Jardins', 'Un druide qui parle aux plantes', 'druid', 'common',
 '{"primary": "90 128 96", "accent": "123 155 123", "glow": "168 208 168"}',
 'category_bonus', '+20% or sur les quetes Exterieur & Plantes', '{"category": "Extérieur & Plantes", "bonus_percent": 20}',
 'Les plantes poussent deux fois plus vite sous ses soins.', 'free', true),

('Barde Motivant', 'Un barde dont les chansons inspirent le menage', 'bard', 'epic',
 '{"primary": "155 140 181", "accent": "200 184 216", "glow": "224 208 240"}',
 'streak_shield', 'Protege votre serie 1 fois cette semaine', '{"shield_count": 1}',
 'Sa musique donne envie de nettoyer en dansant.', 'level', true),

('Dragon Domestique', 'Un petit dragon qui brule la poussiere', 'dragon', 'legendary',
 '{"primary": "176 112 96", "accent": "212 160 144", "glow": "240 192 168"}',
 'point_multiplier', 'x1.5 sur tout lor gagne', '{"multiplier": 1.5}',
 'Il crache juste assez de feu pour calciner la crasse.', 'level', true),

('Moine de Ordre', 'Un moine voue au nettoyage methodique', 'monk', 'common',
 '{"primary": "139 107 74", "accent": "168 136 96", "glow": "208 184 152"}',
 'time_reduction', '-5 min sur les quetes de 20+ min', '{"reduction_minutes": 5, "min_duration": 20}',
 'La discipline est sa force, ordre sa devotion.', 'free', true),

('Ange Celeste', 'Un ange aux ailes dorees qui purifie les espaces', 'angel', 'legendary',
 '{"primary": "212 195 130", "accent": "230 215 160", "glow": "245 235 200"}',
 'point_multiplier', 'x1.5 sur tout lor gagne cette semaine', '{"multiplier": 1.5}',
 'Ses plumes dorees tombent la ou la lumiere touche la poussiere.', 'level', true),

('Gardien du Chateau', 'Un garde vigilant qui protege lordre du foyer', 'guardian', 'common',
 '{"primary": "178 145 72", "accent": "196 163 90", "glow": "220 200 140"}',
 'category_bonus', '+20% or sur les quetes Rangement', '{"category": "Rangement", "bonus_percent": 20}',
 'Rien nechappe a sa vigilance.', 'free', true),

('Dame des Roses', 'Une noble dame dont les jardins sont legendaires', 'noblewoman', 'epic',
 '{"primary": "60 90 55", "accent": "90 128 80", "glow": "140 180 130"}',
 'category_bonus', '+25% or sur les quetes Exterieur & Plantes', '{"category": "Extérieur & Plantes", "bonus_percent": 25}',
 'Ses rosiers fleurissent meme en hiver.', 'level', true),

('Oracle des Saules', 'Un mystique qui voit la crasse avant quelle napparaisse', 'oracle', 'rare',
 '{"primary": "85 95 115", "accent": "115 125 145", "glow": "165 175 195"}',
 'streak_shield', 'Protege votre serie 2 fois cette semaine', '{"shield_count": 2}',
 'Ses yeux voient au-dela du visible.', 'free', true),

('Barde des Prairies', 'Une musicienne errante dont les chants allegent le labeur', 'wanderer', 'common',
 '{"primary": "195 150 150", "accent": "215 175 170", "glow": "235 205 200"}',
 'time_reduction', '-3 min sur toutes les quetes', '{"reduction_minutes": 3, "min_duration": 10}',
 'Pieds nus dans lherbe, son tambourin rythme les gestes du menage.', 'free', true);

-- 6. Verify seed worked
SELECT count(*) as avatar_count FROM avatars WHERE is_weekly_eligible = true;

-- 7. Drop existing functions (return type may have changed)
DROP FUNCTION IF EXISTS assign_weekly_character(uuid, uuid);
DROP FUNCTION IF EXISTS get_character_collection(uuid);
DROP FUNCTION IF EXISTS reveal_weekly_character(uuid);

-- 8. RPC: Assign weekly character
CREATE OR REPLACE FUNCTION assign_weekly_character(
    p_household_id UUID,
    p_profile_id UUID
) RETURNS TABLE(
    weekly_id UUID,
    avatar_id UUID,
    avatar_name TEXT,
    character_class VARCHAR,
    rarity VARCHAR,
    color_theme JSONB,
    power_type VARCHAR,
    power_description TEXT,
    power_value JSONB,
    lore_text TEXT,
    is_revealed BOOLEAN
) AS $$
DECLARE
    v_week_start DATE;
    v_week_end DATE;
    v_existing_id UUID;
    v_avatar_id UUID;
BEGIN
    v_week_start := date_trunc('week', CURRENT_DATE)::date;
    v_week_end := v_week_start + 6;

    SELECT wc.id, wc.avatar_id INTO v_existing_id, v_avatar_id
    FROM weekly_characters wc
    WHERE wc.household_id = p_household_id
      AND wc.profile_id = p_profile_id
      AND wc.week_start = v_week_start;

    IF v_existing_id IS NOT NULL THEN
        RETURN QUERY
        SELECT wc.id, a.id, a.name, a.character_class, a.rarity,
               a.color_theme, a.power_type, a.power_description, a.power_value, a.lore_text,
               wc.is_revealed
        FROM weekly_characters wc
        JOIN avatars a ON a.id = wc.avatar_id
        WHERE wc.id = v_existing_id;
        RETURN;
    END IF;

    SELECT a.id INTO v_avatar_id FROM avatars a
    WHERE a.is_weekly_eligible = true
    ORDER BY
        CASE a.rarity
            WHEN 'legendary' THEN random() * 0.05
            WHEN 'epic' THEN random() * 0.15
            WHEN 'rare' THEN random() * 0.30
            WHEN 'common' THEN random() * 0.50
        END DESC
    LIMIT 1;

    INSERT INTO weekly_characters (household_id, profile_id, avatar_id, week_start, week_end)
    VALUES (p_household_id, p_profile_id, v_avatar_id, v_week_start, v_week_end);

    INSERT INTO character_collection (profile_id, avatar_id)
    VALUES (p_profile_id, v_avatar_id)
    ON CONFLICT (profile_id, avatar_id)
    DO UPDATE SET times_received = character_collection.times_received + 1;

    RETURN QUERY
    SELECT wc.id, a.id, a.name, a.character_class, a.rarity,
           a.color_theme, a.power_type, a.power_description, a.power_value, a.lore_text,
           wc.is_revealed
    FROM weekly_characters wc
    JOIN avatars a ON a.id = wc.avatar_id
    WHERE wc.household_id = p_household_id
      AND wc.profile_id = p_profile_id
      AND wc.week_start = v_week_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC: Get character collection
CREATE OR REPLACE FUNCTION get_character_collection(
    p_profile_id UUID
) RETURNS TABLE(
    avatar_id UUID,
    avatar_name TEXT,
    description TEXT,
    character_class VARCHAR,
    rarity VARCHAR,
    color_theme JSONB,
    power_type VARCHAR,
    power_description TEXT,
    power_value JSONB,
    lore_text TEXT,
    times_received INT,
    is_favorite BOOLEAN,
    is_collected BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        a.description,
        a.character_class,
        a.rarity,
        a.color_theme,
        a.power_type,
        a.power_description,
        a.power_value,
        a.lore_text,
        COALESCE(cc.times_received, 0),
        COALESCE(cc.is_favorite, false),
        cc.id IS NOT NULL
    FROM avatars a
    LEFT JOIN character_collection cc ON cc.avatar_id = a.id AND cc.profile_id = p_profile_id
    WHERE a.is_weekly_eligible = true
    ORDER BY
        CASE WHEN cc.id IS NOT NULL THEN 0 ELSE 1 END,
        CASE a.rarity
            WHEN 'legendary' THEN 0
            WHEN 'epic' THEN 1
            WHEN 'rare' THEN 2
            WHEN 'common' THEN 3
        END,
        a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC: Reveal weekly character
CREATE OR REPLACE FUNCTION reveal_weekly_character(
    p_weekly_id UUID
) RETURNS VOID AS $$
BEGIN
    UPDATE weekly_characters
    SET is_revealed = true, revealed_at = NOW()
    WHERE id = p_weekly_id AND profile_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
