-- Script complet de configuration pour la création de foyers
-- Exécutez ce script ENTIER dans le SQL Editor de Supabase

-- ============================================
-- 1. FONCTIONS UTILITAIRES
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

-- Fonction pour vérifier l'appartenance à un foyer (sans récursion)
CREATE OR REPLACE FUNCTION is_household_member(household_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = household_uuid
    AND profile_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_household_admin(household_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = household_uuid
    AND profile_id = user_uuid
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. FONCTION PRINCIPALE DE CRÉATION DE FOYER
-- ============================================

CREATE OR REPLACE FUNCTION create_household_with_admin(
  household_name TEXT,
  creator_id UUID
)
RETURNS TABLE (
  household_id UUID,
  household_name_out TEXT,
  invite_code_out TEXT
) AS $$
DECLARE
  new_household_id UUID;
  new_invite_code TEXT;
BEGIN
  -- Générer un code d'invitation unique
  new_invite_code := generate_invite_code();

  -- Créer le foyer (SECURITY DEFINER bypass RLS)
  INSERT INTO households (name, invite_code, created_by)
  VALUES (household_name, new_invite_code, creator_id)
  RETURNING id INTO new_household_id;

  -- Ajouter le créateur comme admin
  INSERT INTO household_members (household_id, profile_id, role)
  VALUES (new_household_id, creator_id, 'admin');

  -- Retourner les informations du foyer créé
  RETURN QUERY
  SELECT new_household_id, household_name, new_invite_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION create_household_with_admin(TEXT, UUID) TO authenticated;

-- ============================================
-- 3. POLITIQUES RLS
-- ============================================

-- Supprimer les anciennes politiques sur household_members
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'household_members') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON household_members';
    END LOOP;
END $$;

-- Créer les nouvelles politiques sur household_members
CREATE POLICY "Users can view household members"
ON household_members FOR SELECT
USING (is_household_member(household_id, auth.uid()));

CREATE POLICY "Users can join households"
ON household_members FOR INSERT
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can manage members"
ON household_members FOR DELETE
USING (is_household_admin(household_id, auth.uid()));

CREATE POLICY "Admins can update members"
ON household_members FOR UPDATE
USING (is_household_admin(household_id, auth.uid()));

-- Supprimer les anciennes politiques sur households
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'households') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON households';
    END LOOP;
END $$;

-- Créer les nouvelles politiques sur households
CREATE POLICY "Users can view their households"
ON households FOR SELECT
USING (is_household_member(id, auth.uid()));

-- Note: Pas besoin de politique INSERT car on utilise la fonction RPC
-- qui bypass RLS avec SECURITY DEFINER

CREATE POLICY "Admins can update their households"
ON households FOR UPDATE
USING (is_household_admin(id, auth.uid()));

-- Activer RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. VÉRIFICATION
-- ============================================

-- Afficher les politiques créées
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('households', 'household_members')
ORDER BY tablename, policyname;

-- Afficher les fonctions créées
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'generate_invite_code',
  'is_household_member',
  'is_household_admin',
  'create_household_with_admin'
)
ORDER BY routine_name;
