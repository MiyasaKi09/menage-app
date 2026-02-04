-- Script pour créer manuellement les household_tasks depuis les task_templates
-- À utiliser si le questionnaire n'a pas créé les tâches automatiquement

-- Foyer: La Mouff'
-- ID: 9d191766-c47e-4d9d-b5af-87b287e5037f

DO $$
DECLARE
  target_household_id UUID := '9d191766-c47e-4d9d-b5af-87b287e5037f';
BEGIN
  -- Insérer toutes les tâches depuis les templates
  INSERT INTO household_tasks (
    household_id,
    template_id,
    is_active,
    custom_points
  )
  SELECT
    target_household_id,
    tt.id,
    true,
    tt.base_points
  FROM task_templates tt
  WHERE NOT EXISTS (
    -- Éviter les doublons
    SELECT 1 FROM household_tasks ht
    WHERE ht.household_id = target_household_id
    AND ht.template_id = tt.id
  );

  RAISE NOTICE 'Tasks created successfully!';
END $$;

-- Vérifier le résultat
SELECT
  h.name as household,
  COUNT(ht.id) as tasks_count
FROM households h
LEFT JOIN household_tasks ht ON h.id = ht.household_id
GROUP BY h.id, h.name;
