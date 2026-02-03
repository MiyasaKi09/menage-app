-- Correction des politiques RLS pour éviter la récursion infinie
-- Exécutez ce script dans le SQL Editor de Supabase

-- 1. Supprimer TOUTES les politiques existantes sur household_members
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'household_members') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON household_members';
    END LOOP;
END $$;

-- 2. Créer une fonction helper qui vérifie l'appartenance sans récursion
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

-- 3. Créer une fonction helper qui vérifie si l'utilisateur est admin
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

-- 4. Recréer les politiques sans récursion
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

-- 5. Supprimer TOUTES les politiques existantes sur households
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'households') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON households';
    END LOOP;
END $$;

CREATE POLICY "Users can view their households"
ON households FOR SELECT
USING (is_household_member(id, auth.uid()));

CREATE POLICY "Users can create households"
ON households FOR INSERT
WITH CHECK (true);  -- Tout le monde peut créer un foyer

CREATE POLICY "Admins can update their households"
ON households FOR UPDATE
USING (is_household_admin(id, auth.uid()));

-- 6. Vérifier que RLS est activé
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Afficher les politiques créées
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('households', 'household_members')
ORDER BY tablename, policyname;
