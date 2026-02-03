-- Correction de la politique INSERT sur households
-- Le problème: WITH CHECK (true) ne suffit pas, il faut vérifier created_by

-- Supprimer et recréer la politique INSERT sur households
DROP POLICY IF EXISTS "Users can create households" ON households;

CREATE POLICY "Users can create households"
ON households FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Vérifier les politiques
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'households'
ORDER BY policyname;
