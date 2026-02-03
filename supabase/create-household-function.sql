-- Fonction pour créer un foyer ET ajouter le créateur comme admin
-- Cette fonction utilise SECURITY DEFINER pour bypasser les politiques RLS

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

  -- Créer le foyer
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

-- Accorder les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION create_household_with_admin(TEXT, UUID) TO authenticated;

-- Tester la fonction (optionnel - commenté)
-- SELECT * FROM create_household_with_admin('Test Foyer', auth.uid());
