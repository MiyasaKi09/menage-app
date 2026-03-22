-- ============================================
-- MIGRATION 012: Corvées — référentiel + activation par fief
-- ============================================
-- corvee_templates = référentiel commun (comme task_templates)
-- household_corvees = un fief active une corvée du référentiel
-- corvee_steps = étapes hebdomadaires générées par fief

-- Drop old tables if they exist from previous version
DROP TABLE IF EXISTS corvee_steps CASCADE;
DROP TABLE IF EXISTS corvees CASCADE;

-- ============================================
-- 1. Référentiel des corvées (partagé entre tous les fiefs)
-- ============================================
CREATE TABLE corvee_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    emoji VARCHAR(10) DEFAULT '🧹',
    steps_per_week INT NOT NULL DEFAULT 7, -- 7=quotidien, 3=2-3x/semaine, 1=hebdo
    points_per_step INT NOT NULL DEFAULT 10,
    difficulty INT CHECK (difficulty BETWEEN 1 AND 5) DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed corvées de base
INSERT INTO corvee_templates (name, emoji, steps_per_week, points_per_step, difficulty, description) VALUES
('Vaisselle', '🍽️', 7, 10, 2, 'Faire la vaisselle ou vider/remplir le lave-vaisselle'),
('Lessive', '👕', 3, 15, 2, 'Lancer une machine, étendre ou plier le linge'),
('Cuisine', '🍳', 5, 12, 3, 'Préparer les repas de la journée'),
('Poubelles', '🗑️', 3, 8, 1, 'Sortir les poubelles et changer les sacs'),
('Aspirateur', '🧹', 2, 15, 2, 'Passer l''aspirateur dans les pièces principales'),
('Serpillère', '🧽', 1, 20, 3, 'Passer la serpillère sur tous les sols'),
('Rangement', '📦', 3, 10, 2, 'Ranger les pièces communes'),
('Litière', '🐱', 7, 8, 1, 'Nettoyer la litière du chat'),
('Courses', '🛒', 2, 20, 3, 'Faire les courses de la semaine'),
('Salle de bain', '🚿', 2, 15, 3, 'Nettoyer la salle de bain')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. Corvées activées par un fief
-- ============================================
CREATE TABLE household_corvees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    corvee_template_id UUID NOT NULL REFERENCES corvee_templates(id) ON DELETE CASCADE,

    -- Surcharges optionnelles
    custom_steps_per_week INT, -- null = utilise le défaut du template
    custom_points_per_step INT,

    -- Assignation (null = tournante entre membres)
    assigned_to UUID REFERENCES profiles(id),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(household_id, corvee_template_id)
);

-- ============================================
-- 3. Étapes hebdomadaires (générées par semaine par fief)
-- ============================================
CREATE TABLE corvee_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_corvee_id UUID NOT NULL REFERENCES household_corvees(id) ON DELETE CASCADE,

    week_start DATE NOT NULL,
    step_number INT NOT NULL,

    status VARCHAR(20) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES profiles(id),
    points_earned INT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(household_corvee_id, week_start, step_number)
);

-- Index
CREATE INDEX idx_household_corvees_active ON household_corvees(household_id) WHERE is_active = TRUE;
CREATE INDEX idx_corvee_steps_week ON corvee_steps(household_corvee_id, week_start);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE corvee_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_corvees ENABLE ROW LEVEL SECURITY;
ALTER TABLE corvee_steps ENABLE ROW LEVEL SECURITY;

-- Templates : lisibles par tous les authentifiés
CREATE POLICY "Corvee templates readable by authenticated"
    ON corvee_templates FOR SELECT TO authenticated USING (true);

-- Household corvées : visibles par les membres
CREATE POLICY "Household corvees visible by members"
    ON household_corvees FOR SELECT USING (
        household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
    );

CREATE POLICY "Household corvees manageable by admins"
    ON household_corvees FOR ALL USING (
        household_id IN (
            SELECT household_id FROM household_members
            WHERE profile_id = auth.uid() AND role = 'admin'
        )
    );

-- Steps : visibles et modifiables par les membres
CREATE POLICY "Corvee steps visible by members"
    ON corvee_steps FOR SELECT USING (
        household_corvee_id IN (
            SELECT hc.id FROM household_corvees hc
            JOIN household_members hm ON hm.household_id = hc.household_id
            WHERE hm.profile_id = auth.uid()
        )
    );

CREATE POLICY "Corvee steps completable by members"
    ON corvee_steps FOR UPDATE USING (
        household_corvee_id IN (
            SELECT hc.id FROM household_corvees hc
            JOIN household_members hm ON hm.household_id = hc.household_id
            WHERE hm.profile_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTION: Générer les étapes de la semaine
-- ============================================
CREATE OR REPLACE FUNCTION generate_corvee_steps(
    p_household_id UUID,
    p_week_start DATE DEFAULT date_trunc('week', CURRENT_DATE)::DATE
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rec RECORD;
    v_steps INT;
    v_points INT;
    v_created INT := 0;
BEGIN
    FOR v_rec IN
        SELECT hc.id as hc_id, ct.steps_per_week, ct.points_per_step,
               hc.custom_steps_per_week, hc.custom_points_per_step
        FROM household_corvees hc
        JOIN corvee_templates ct ON ct.id = hc.corvee_template_id
        WHERE hc.household_id = p_household_id AND hc.is_active = TRUE
    LOOP
        v_steps := COALESCE(v_rec.custom_steps_per_week, v_rec.steps_per_week);
        v_points := COALESCE(v_rec.custom_points_per_step, v_rec.points_per_step);

        FOR i IN 1..v_steps LOOP
            INSERT INTO corvee_steps (household_corvee_id, week_start, step_number, points_earned)
            VALUES (v_rec.hc_id, p_week_start, i, v_points)
            ON CONFLICT (household_corvee_id, week_start, step_number) DO NOTHING;
            IF FOUND THEN v_created := v_created + 1; END IF;
        END LOOP;
    END LOOP;

    RETURN v_created;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_corvee_steps(UUID, DATE) TO authenticated;

-- ============================================
-- FUNCTION: Récupérer la corvée active avec ses étapes
-- ============================================
CREATE OR REPLACE FUNCTION get_weekly_corvee(
    p_household_id UUID,
    p_week_start DATE DEFAULT date_trunc('week', CURRENT_DATE)::DATE
)
RETURNS TABLE (
    corvee_id UUID,
    corvee_name VARCHAR(100),
    corvee_emoji VARCHAR(10),
    steps_per_week INT,
    points_per_step INT,
    step_id UUID,
    step_number INT,
    step_status VARCHAR(20),
    step_completed_at TIMESTAMPTZ,
    step_points_earned INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        hc.id as corvee_id,
        ct.name as corvee_name,
        ct.emoji as corvee_emoji,
        COALESCE(hc.custom_steps_per_week, ct.steps_per_week) as steps_per_week,
        COALESCE(hc.custom_points_per_step, ct.points_per_step) as points_per_step,
        cs.id as step_id,
        cs.step_number,
        cs.status as step_status,
        cs.completed_at as step_completed_at,
        cs.points_earned as step_points_earned
    FROM household_corvees hc
    JOIN corvee_templates ct ON ct.id = hc.corvee_template_id
    LEFT JOIN corvee_steps cs ON cs.household_corvee_id = hc.id AND cs.week_start = p_week_start
    WHERE hc.household_id = p_household_id AND hc.is_active = TRUE
    ORDER BY ct.name, cs.step_number;
END;
$$;

GRANT EXECUTE ON FUNCTION get_weekly_corvee(UUID, DATE) TO authenticated;
