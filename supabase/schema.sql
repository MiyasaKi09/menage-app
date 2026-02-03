-- ============================================
-- SCHEMA SUPABASE - APP GAMIFICATION MÉNAGE
-- ============================================

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLES DE RÉFÉRENCE (données statiques)
-- ============================================

-- Catégories de tâches
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fréquences possibles
CREATE TABLE frequencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) NOT NULL UNIQUE,
    label VARCHAR(50) NOT NULL,
    days_min INT NOT NULL,
    days_max INT NOT NULL,
    days_default INT NOT NULL,
    is_adjustable BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- Bibliothèque des tâches (référentiel)
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    duration_minutes INT NOT NULL,
    difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
    base_points INT NOT NULL,
    frequency_id UUID REFERENCES frequencies(id),
    is_adjustable BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT '{}',
    tip TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche par tags
CREATE INDEX idx_task_templates_tags ON task_templates USING GIN(tags);

-- ============================================
-- 2. UTILISATEURS ET PROFILS
-- ============================================

-- Profils utilisateurs (lié à auth.users de Supabase)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    email VARCHAR(255),
    avatar_id UUID,

    -- Stats globales
    total_points INT DEFAULT 0,
    current_level INT DEFAULT 1,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    tasks_completed INT DEFAULT 0,

    -- Préférences
    notification_enabled BOOLEAN DEFAULT TRUE,
    notification_time TIME DEFAULT '09:00',
    language VARCHAR(10) DEFAULT 'fr',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réponses au questionnaire initial
CREATE TABLE profile_questionnaire (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

    -- Style de vie
    living_situation VARCHAR(30), -- 'alone', 'couple', 'roommates', 'family'
    household_size INT DEFAULT 1,
    has_children BOOLEAN DEFAULT FALSE,
    children_ages INT[] DEFAULT '{}',
    has_pets BOOLEAN DEFAULT FALSE,
    pet_types TEXT[] DEFAULT '{}', -- ['cat', 'dog', 'fish', etc.]

    -- Logement
    home_type VARCHAR(30), -- 'apartment', 'house', 'studio'
    home_size_m2 INT,
    num_rooms INT,
    has_outdoor_space BOOLEAN DEFAULT FALSE,
    outdoor_type VARCHAR(30), -- 'balcony', 'terrace', 'garden'

    -- Équipements
    has_dishwasher BOOLEAN DEFAULT FALSE,
    has_dryer BOOLEAN DEFAULT FALSE,
    has_robot_vacuum BOOLEAN DEFAULT FALSE,
    has_ac BOOLEAN DEFAULT FALSE,
    water_hardness VARCHAR(20) DEFAULT 'medium', -- 'soft', 'medium', 'hard'

    -- Disponibilité
    available_minutes_daily INT DEFAULT 30,
    preferred_cleaning_days TEXT[] DEFAULT '{}', -- ['monday', 'saturday', etc.]
    preferred_time_of_day VARCHAR(20) DEFAULT 'morning', -- 'morning', 'afternoon', 'evening'

    -- Standards et préférences
    cleanliness_level INT CHECK (cleanliness_level BETWEEN 1 AND 5) DEFAULT 3, -- 1=relax, 5=maniaque
    most_hated_tasks TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. FOYERS (groupes)
-- ============================================

-- Foyers
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(8) UNIQUE NOT NULL,
    created_by UUID REFERENCES profiles(id),

    -- Paramètres du foyer
    points_to_reward INT DEFAULT 500, -- points pour débloquer une récompense

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membres des foyers
CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'

    -- Stats dans ce foyer
    points_in_household INT DEFAULT 0,
    tasks_completed_in_household INT DEFAULT 0,

    joined_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(household_id, profile_id)
);

-- ============================================
-- 4. TÂCHES PERSONNALISÉES ET PLANIFICATION
-- ============================================

-- Tâches actives du foyer (personnalisées depuis les templates)
CREATE TABLE household_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    template_id UUID REFERENCES task_templates(id),

    -- Surcharge des valeurs par défaut si personnalisé
    custom_name VARCHAR(100),
    custom_duration_minutes INT,
    custom_points INT,
    custom_frequency_days INT,
    custom_tip TEXT,

    -- Planification
    is_active BOOLEAN DEFAULT TRUE,
    last_completed_at TIMESTAMPTZ,
    next_due_at TIMESTAMPTZ,

    -- Assignation préférée (optionnel)
    preferred_assignee_id UUID REFERENCES profiles(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tâches planifiées (todo list quotidienne/hebdo)
CREATE TABLE scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_task_id UUID REFERENCES household_tasks(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,

    -- Assignation
    assigned_to UUID REFERENCES profiles(id),
    assigned_by UUID REFERENCES profiles(id),

    -- Planning
    scheduled_date DATE NOT NULL,
    due_time TIME,

    -- Statut
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES profiles(id),

    -- Points gagnés (peut varier avec bonus)
    points_earned INT,

    -- Feedback
    was_difficult BOOLEAN,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_scheduled_tasks_date ON scheduled_tasks(scheduled_date);
CREATE INDEX idx_scheduled_tasks_household ON scheduled_tasks(household_id, scheduled_date);
CREATE INDEX idx_scheduled_tasks_assigned ON scheduled_tasks(assigned_to, status);

-- ============================================
-- 5. HISTORIQUE ET STATS
-- ============================================

-- Historique des tâches complétées
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheduled_task_id UUID REFERENCES scheduled_tasks(id),
    household_id UUID REFERENCES households(id),
    profile_id UUID REFERENCES profiles(id),
    task_template_id UUID REFERENCES task_templates(id),

    task_name VARCHAR(100) NOT NULL,
    category_name VARCHAR(50),

    points_earned INT NOT NULL,
    duration_actual_minutes INT,

    completed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Pour analytics
    day_of_week INT,
    hour_of_day INT
);

-- Index pour analytics
CREATE INDEX idx_task_history_profile ON task_history(profile_id, completed_at);
CREATE INDEX idx_task_history_household ON task_history(household_id, completed_at);

-- ============================================
-- 6. GAMIFICATION
-- ============================================

-- Avatars/Personnages disponibles
CREATE TABLE avatars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    image_url TEXT,

    -- Déblocage
    unlock_type VARCHAR(20) DEFAULT 'free', -- 'free', 'level', 'achievement', 'purchase'
    unlock_requirement INT, -- niveau requis si 'level'
    unlock_achievement_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Niveaux et XP requis
CREATE TABLE levels (
    level INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    points_required INT NOT NULL,
    badge_url TEXT,
    perks TEXT[] DEFAULT '{}'
);

-- Badges/Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,

    -- Conditions
    condition_type VARCHAR(30), -- 'tasks_completed', 'streak', 'category_master', 'points', etc.
    condition_value INT,
    condition_category_id UUID REFERENCES categories(id),

    -- Récompense
    points_reward INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements débloqués par les utilisateurs
CREATE TABLE profile_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(profile_id, achievement_id)
);

-- Streaks (séries)
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,

    streak_type VARCHAR(30) DEFAULT 'daily', -- 'daily', 'weekly'
    current_count INT DEFAULT 0,
    longest_count INT DEFAULT 0,
    last_activity_date DATE,

    UNIQUE(profile_id, household_id, streak_type)
);

-- ============================================
-- 7. RÉCOMPENSES SOCIALES
-- ============================================

-- Types de récompenses disponibles dans un foyer
CREATE TABLE reward_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    points_cost INT NOT NULL,

    -- Qui doit fournir la récompense
    provider_type VARCHAR(20) DEFAULT 'any', -- 'any', 'specific', 'rotate'

    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Récompenses gagnées/réclamées
CREATE TABLE rewards_earned (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reward_type_id UUID REFERENCES reward_types(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,

    -- Qui a gagné
    earned_by UUID REFERENCES profiles(id),
    earned_at TIMESTAMPTZ DEFAULT NOW(),

    -- Qui doit fournir
    provided_by UUID REFERENCES profiles(id),

    -- Statut
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'claimed', 'fulfilled', 'expired'
    claimed_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ,

    notes TEXT
);

-- ============================================
-- 8. NOTIFICATIONS ET MESSAGES
-- ============================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

    type VARCHAR(30) NOT NULL, -- 'task_reminder', 'reward_earned', 'achievement', 'nudge', etc.
    title VARCHAR(200) NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',

    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_profile ON notifications(profile_id, is_read, created_at);

-- Messages/Encouragements contextuels
CREATE TABLE motivational_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    trigger_type VARCHAR(30) NOT NULL, -- 'task_complete', 'streak', 'level_up', 'struggling', etc.
    trigger_value INT, -- ex: streak de 7

    message TEXT NOT NULL,
    emoji VARCHAR(10),

    -- Ciblage
    cleanliness_level_min INT,
    cleanliness_level_max INT,

    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 9. FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour générer un code d'invitation unique
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(8) := '';
    i INT;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer le code d'invitation à la création du foyer
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := generate_invite_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invite_code
    BEFORE INSERT ON households
    FOR EACH ROW
    EXECUTE FUNCTION set_invite_code();

-- Fonction pour calculer les points avec bonus
CREATE OR REPLACE FUNCTION calculate_points(
    base_points INT,
    streak_count INT,
    is_difficult_task BOOLEAN DEFAULT FALSE
)
RETURNS INT AS $$
DECLARE
    multiplier DECIMAL := 1.0;
BEGIN
    -- Bonus streak (max +50%)
    IF streak_count >= 7 THEN
        multiplier := multiplier + 0.5;
    ELSIF streak_count >= 3 THEN
        multiplier := multiplier + 0.25;
    ELSIF streak_count >= 1 THEN
        multiplier := multiplier + 0.1;
    END IF;

    -- Bonus tâche difficile
    IF is_difficult_task THEN
        multiplier := multiplier + 0.2;
    END IF;

    RETURN ROUND(base_points * multiplier);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le niveau selon les points
CREATE OR REPLACE FUNCTION get_level_for_points(points INT)
RETURNS INT AS $$
BEGIN
    RETURN COALESCE(
        (SELECT level FROM levels WHERE points_required <= points ORDER BY level DESC LIMIT 1),
        1
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables pertinentes
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_household_tasks_updated_at BEFORE UPDATE ON household_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_scheduled_tasks_updated_at BEFORE UPDATE ON scheduled_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON task_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profile_questionnaire_updated_at BEFORE UPDATE ON profile_questionnaire FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables utilisateurs
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_questionnaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_earned ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy pour voir les profils des membres du même foyer
CREATE POLICY "Users can view household members profiles" ON profiles FOR SELECT USING (
    id IN (
        SELECT hm2.profile_id FROM household_members hm1
        JOIN household_members hm2 ON hm1.household_id = hm2.household_id
        WHERE hm1.profile_id = auth.uid()
    )
);

-- Policies pour questionnaire
CREATE POLICY "Users can manage own questionnaire" ON profile_questionnaire
    FOR ALL USING (profile_id = auth.uid());

-- Policies pour households
CREATE POLICY "Users can view their households" ON households FOR SELECT USING (
    id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
);
CREATE POLICY "Users can create households" ON households FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Admins can update households" ON households FOR UPDATE USING (
    id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid() AND role = 'admin')
);

-- Policies pour household_members
CREATE POLICY "Users can view household members" ON household_members FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
);
CREATE POLICY "Users can join households" ON household_members FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Admins can manage members" ON household_members FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid() AND role = 'admin')
);

-- Policies pour tâches du foyer
CREATE POLICY "Members can view household tasks" ON household_tasks FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
);
CREATE POLICY "Members can manage household tasks" ON household_tasks FOR ALL USING (
    household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
);

-- Policies pour scheduled_tasks
CREATE POLICY "Members can view scheduled tasks" ON scheduled_tasks FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
);
CREATE POLICY "Members can manage scheduled tasks" ON scheduled_tasks FOR ALL USING (
    household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
);

-- Policies pour task_history
CREATE POLICY "Members can view task history" ON task_history FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
    OR profile_id = auth.uid()
);
CREATE POLICY "System can insert task history" ON task_history FOR INSERT WITH CHECK (
    profile_id = auth.uid()
);

-- Policies pour rewards
CREATE POLICY "Members can view rewards" ON rewards_earned FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
);
CREATE POLICY "Members can manage rewards" ON rewards_earned FOR ALL USING (
    household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
);

-- Policies pour notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (profile_id = auth.uid());

-- Policies pour achievements
CREATE POLICY "Users can view own achievements" ON profile_achievements FOR SELECT USING (profile_id = auth.uid());

-- Policies pour streaks
CREATE POLICY "Users can view own streaks" ON streaks FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can manage own streaks" ON streaks FOR ALL USING (profile_id = auth.uid());

-- ============================================
-- 11. DONNÉES INITIALES
-- ============================================

-- Insérer les catégories
INSERT INTO categories (name, emoji, description, display_order) VALUES
('Cuisine', '🍳', 'Vaisselle, électroménager, surfaces, poubelles', 1),
('Salle de bain', '🚿', 'Sanitaires, douche, accessoires, aération', 2),
('Chambre', '🛏️', 'Literie, rangement, dépoussiérage, sols', 3),
('Salon', '🛋️', 'Meubles, sols, vitres, décoration', 4),
('Entrée', '🚪', 'Sols, rangement, porte, couloirs', 5),
('Buanderie', '🧺', 'Linge, machines, repassage', 6),
('Extérieur', '🌿', 'Balcon, terrasse, jardin, garage', 7),
('Général', '🏠', 'Transversal, aération, maintenance', 8),
('Animaux', '🐾', 'Litière, gamelles, poils, cages', 9),
('Enfants', '👶', 'Jouets, hygiène, équipements bébé', 10),
('Saisonnier', '🗓️', 'Tâches annuelles, changements de saison', 11);

-- Insérer les fréquences
INSERT INTO frequencies (code, label, days_min, days_max, days_default, is_adjustable, description) VALUES
('daily', 'Quotidien', 1, 1, 1, FALSE, 'Tous les jours'),
('2-3x_week', '2-3x/semaine', 2, 4, 3, TRUE, 'Plusieurs fois par semaine'),
('weekly', 'Hebdomadaire', 5, 10, 7, TRUE, 'Une fois par semaine'),
('biweekly', 'Bi-mensuel', 10, 18, 14, TRUE, 'Toutes les deux semaines'),
('monthly', 'Mensuel', 20, 45, 30, TRUE, 'Une fois par mois'),
('quarterly', 'Trimestriel', 60, 120, 90, TRUE, 'Tous les 3 mois'),
('biannual', 'Semestriel', 150, 200, 180, TRUE, 'Deux fois par an'),
('annual', 'Annuel', 300, 400, 365, TRUE, 'Une fois par an'),
('seasonal', 'Saisonnier', 80, 100, 90, TRUE, 'Selon la saison'),
('after_use', 'Après usage', 0, 0, 0, FALSE, 'Immédiatement après utilisation');

-- Insérer les niveaux
INSERT INTO levels (level, name, points_required, perks) VALUES
(1, 'Débutant', 0, ARRAY['Accès basique']),
(2, 'Apprenti', 100, ARRAY['Nouveaux avatars']),
(3, 'Initié', 300, ARRAY['Badges spéciaux']),
(4, 'Confirmé', 600, ARRAY['Défis hebdo']),
(5, 'Expert', 1000, ARRAY['Récompenses bonus']),
(6, 'Maître', 1500, ARRAY['Avatars rares']),
(7, 'Grand Maître', 2500, ARRAY['Personnalisation avancée']),
(8, 'Légende', 4000, ARRAY['Titre spécial']),
(9, 'Mythique', 6000, ARRAY['Avatar légendaire']),
(10, 'Transcendant', 10000, ARRAY['Tout débloqué']);

-- Insérer quelques achievements de base
INSERT INTO achievements (code, name, description, condition_type, condition_value, points_reward) VALUES
('first_task', 'Premier Pas', 'Compléter sa première tâche', 'tasks_completed', 1, 10),
('streak_3', 'Régulier', 'Maintenir une série de 3 jours', 'streak', 3, 25),
('streak_7', 'Semaine Parfaite', 'Maintenir une série de 7 jours', 'streak', 7, 50),
('streak_30', 'Mois Impeccable', 'Maintenir une série de 30 jours', 'streak', 30, 200),
('tasks_10', 'Productif', 'Compléter 10 tâches', 'tasks_completed', 10, 30),
('tasks_50', 'Travailleur', 'Compléter 50 tâches', 'tasks_completed', 50, 75),
('tasks_100', 'Machine', 'Compléter 100 tâches', 'tasks_completed', 100, 150),
('tasks_500', 'Infatigable', 'Compléter 500 tâches', 'tasks_completed', 500, 500),
('points_1000', 'Millionnaire', 'Accumuler 1000 points', 'points', 1000, 100),
('early_bird', 'Lève-tôt', 'Compléter une tâche avant 8h', 'special', 1, 20),
('night_owl', 'Noctambule', 'Compléter une tâche après 22h', 'special', 1, 20),
('team_player', 'Esprit d''équipe', 'Compléter une tâche assignée par quelqu''un d''autre', 'special', 1, 25),
('reward_giver', 'Généreux', 'Offrir une récompense à un membre', 'special', 1, 30);

-- Insérer les avatars de base
INSERT INTO avatars (name, description, unlock_type, unlock_requirement) VALUES
('Chat Paresseux', 'Un chat qui préfère dormir que nettoyer', 'free', NULL),
('Chien Enthousiaste', 'Toujours prêt à aider !', 'free', NULL),
('Robot Ménager', 'Efficace et méthodique', 'level', 3),
('Fée du Logis', 'Magique et scintillante', 'level', 5),
('Super Héros', 'Combat la poussière avec bravoure', 'level', 7),
('Ninja Propre', 'Discret mais redoutable', 'level', 10);

-- Insérer des messages motivationnels
INSERT INTO motivational_messages (trigger_type, trigger_value, message, emoji) VALUES
('task_complete', NULL, 'Bien joué ! Un pas de plus vers un intérieur nickel 🏠', '✨'),
('task_complete', NULL, 'Tâche accomplie ! Tu gères 💪', '🎉'),
('task_complete', NULL, 'Et une de plus ! Continue comme ça 🚀', '⭐'),
('streak', 3, 'Wow, 3 jours de suite ! Tu es sur une lancée !', '🔥'),
('streak', 7, 'Une semaine complète ! Tu es incroyable !', '🏆'),
('streak', 30, 'UN MOIS ! Tu es une légende vivante !', '👑'),
('level_up', NULL, 'LEVEL UP ! Tu viens de passer au niveau supérieur !', '🎮'),
('struggling', NULL, 'Même 5 minutes comptent ! Commence petit 💙', '💪'),
('struggling', NULL, 'Pas de pression, une tâche à la fois', '🌱');

-- ============================================
-- FIN DU SCHEMA
-- ============================================
