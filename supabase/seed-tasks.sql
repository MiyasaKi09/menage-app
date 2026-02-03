-- Script pour ajouter des tâches de test à un foyer
-- Remplacez 'YOUR_HOUSEHOLD_ID' par l'ID réel de votre foyer (visible sur /household)

-- Récupérer l'ID du foyer (à modifier)
-- Vous pouvez trouver l'ID en allant sur /household et en regardant l'URL

-- Ajouter des tâches populaires du template vers household_tasks
-- Ces tâches seront visibles dans la section Tâches de l'application

-- Cuisine & Vaisselle
INSERT INTO household_tasks (household_id, task_template_id, points_value, is_active)
SELECT
  'YOUR_HOUSEHOLD_ID'::uuid,
  id,
  default_points,
  true
FROM task_templates
WHERE name IN (
  'Faire la vaisselle',
  'Vider le lave-vaisselle',
  'Nettoyer le plan de travail',
  'Sortir les poubelles',
  'Ranger la cuisine'
)
ON CONFLICT DO NOTHING;

-- Nettoyage général
INSERT INTO household_tasks (household_id, task_template_id, points_value, is_active)
SELECT
  'YOUR_HOUSEHOLD_ID'::uuid,
  id,
  default_points,
  true
FROM task_templates
WHERE name IN (
  'Passer l''aspirateur salon',
  'Passer la serpillière',
  'Dépoussiérer les meubles',
  'Nettoyer les vitres',
  'Ranger le salon'
)
ON CONFLICT DO NOTHING;

-- Salle de bain
INSERT INTO household_tasks (household_id, task_template_id, points_value, is_active)
SELECT
  'YOUR_HOUSEHOLD_ID'::uuid,
  id,
  default_points,
  true
FROM task_templates
WHERE name IN (
  'Nettoyer les toilettes',
  'Nettoyer le lavabo',
  'Nettoyer la douche/baignoire',
  'Changer les serviettes'
)
ON CONFLICT DO NOTHING;

-- Linge
INSERT INTO household_tasks (household_id, task_template_id, points_value, is_active)
SELECT
  'YOUR_HOUSEHOLD_ID'::uuid,
  id,
  default_points,
  true
FROM task_templates
WHERE name IN (
  'Faire une lessive',
  'Étendre le linge',
  'Plier et ranger le linge',
  'Repasser'
)
ON CONFLICT DO NOTHING;

-- Courses & Rangement
INSERT INTO household_tasks (household_id, task_template_id, points_value, is_active)
SELECT
  'YOUR_HOUSEHOLD_ID'::uuid,
  id,
  default_points,
  true
FROM task_templates
WHERE name IN (
  'Faire les courses',
  'Ranger les courses',
  'Préparer les repas'
)
ON CONFLICT DO NOTHING;

-- Vérifier le résultat
SELECT
  ht.id,
  tt.name,
  ht.points_value,
  c.name as category
FROM household_tasks ht
JOIN task_templates tt ON ht.task_template_id = tt.id
JOIN categories c ON tt.category_id = c.id
WHERE ht.household_id = 'YOUR_HOUSEHOLD_ID'::uuid
ORDER BY c.name, tt.name;
