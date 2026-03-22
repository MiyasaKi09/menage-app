-- ============================================
-- MIGRATION 012: Table corvées (quêtes hebdomadaires)
-- ============================================
-- Les corvées sont des missions récurrentes hebdomadaires avec un chemin d'étapes.
-- Ex: "Vaisselle" (quotidien) = 7 étapes/semaine, "Linge" (2-3x) = 3 étapes/semaine.
-- Séparées des péripéties (scheduled_tasks) qui sont les tâches one-shot.

-- Corvées définies par l'admin du fief
CREATE TABLE IF NOT EXISTS corvees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,

    -- Infos corvée
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10) DEFAULT '🧹',

    -- Fréquence : combien d'étapes par semaine (calculé depuis la fréquence)
    steps_per_week INT NOT NULL DEFAULT 7, -- 7 = quotidien, 3 = 2-3x/semaine, 1 = hebdo
    points_per_step INT NOT NULL DEFAULT 10,

    -- Assignation (null = tournante entre membres)
    assigned_to UUID REFERENCES profiles(id),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Étapes hebdomadaires d'une corvée (générées chaque semaine)
CREATE TABLE IF NOT EXISTS corvee_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corvee_id UUID NOT NULL REFERENCES corvees(id) ON DELETE CASCADE,

    -- Semaine (ISO week start = lundi)
    week_start DATE NOT NULL,
    step_number INT NOT NULL, -- 1, 2, 3... jusqu'à steps_per_week

    -- Statut
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'skipped'
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES profiles(id),
    points_earned INT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(corvee_id, week_start, step_number)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_corvees_household ON corvees(household_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_corvee_steps_week ON corvee_steps(corvee_id, week_start);

-- RLS Policies
ALTER TABLE corvees ENABLE ROW LEVEL SECURITY;
ALTER TABLE corvee_steps ENABLE ROW LEVEL SECURITY;

-- Corvées : visibles par les membres du foyer
CREATE POLICY "Corvees visible by household members"
    ON corvees FOR SELECT
    USING (
        household_id IN (
            SELECT household_id FROM household_members WHERE profile_id = auth.uid()
        )
    );

-- Corvées : modifiables par les admins
CREATE POLICY "Corvees manageable by household admins"
    ON corvees FOR ALL
    USING (
        household_id IN (
            SELECT household_id FROM household_members
            WHERE profile_id = auth.uid() AND role = 'admin'
        )
    );

-- Steps : visibles par les membres
CREATE POLICY "Corvee steps visible by household members"
    ON corvee_steps FOR SELECT
    USING (
        corvee_id IN (
            SELECT c.id FROM corvees c
            JOIN household_members hm ON hm.household_id = c.household_id
            WHERE hm.profile_id = auth.uid()
        )
    );

-- Steps : modifiables par les membres (pour compléter une étape)
CREATE POLICY "Corvee steps completable by household members"
    ON corvee_steps FOR UPDATE
    USING (
        corvee_id IN (
            SELECT c.id FROM corvees c
            JOIN household_members hm ON hm.household_id = c.household_id
            WHERE hm.profile_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTION: Générer les étapes de la semaine pour toutes les corvées d'un foyer
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
    v_corvee RECORD;
    v_created INT := 0;
BEGIN
    FOR v_corvee IN
        SELECT id, steps_per_week, points_per_step
        FROM corvees
        WHERE household_id = p_household_id AND is_active = TRUE
    LOOP
        FOR i IN 1..v_corvee.steps_per_week LOOP
            INSERT INTO corvee_steps (corvee_id, week_start, step_number, points_earned)
            VALUES (v_corvee.id, p_week_start, i, v_corvee.points_per_step)
            ON CONFLICT (corvee_id, week_start, step_number) DO NOTHING;

            IF FOUND THEN v_created := v_created + 1; END IF;
        END LOOP;
    END LOOP;

    RETURN v_created;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_corvee_steps(UUID, DATE) TO authenticated;

-- ============================================
-- FUNCTION: Récupérer la corvée active du foyer avec ses étapes de la semaine
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
        c.id as corvee_id,
        c.name as corvee_name,
        c.emoji as corvee_emoji,
        c.steps_per_week,
        c.points_per_step,
        cs.id as step_id,
        cs.step_number,
        cs.status as step_status,
        cs.completed_at as step_completed_at,
        cs.points_earned as step_points_earned
    FROM corvees c
    LEFT JOIN corvee_steps cs ON cs.corvee_id = c.id AND cs.week_start = p_week_start
    WHERE c.household_id = p_household_id AND c.is_active = TRUE
    ORDER BY c.name, cs.step_number;
END;
$$;

GRANT EXECUTE ON FUNCTION get_weekly_corvee(UUID, DATE) TO authenticated;
