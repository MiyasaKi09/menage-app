-- Seed script for task_templates
-- This script populates the task_templates table with all tasks referenced by the questionnaire system

-- First, ensure categories exist
INSERT INTO categories (name, icon, description) VALUES
  ('Cuisine & Vaisselle', '🍽️', 'Tâches liées à la cuisine et à la vaisselle'),
  ('Sanitaire', '🚿', 'Nettoyage des toilettes et salle de bain'),
  ('Textile', '👕', 'Lessive, repassage et entretien du linge'),
  ('Salon & Espaces Communs', '🛋️', 'Nettoyage et rangement des espaces de vie'),
  ('Extérieur & Plantes', '🌱', 'Jardinage et entretien extérieur'),
  ('Sols & Surfaces', '🧹', 'Nettoyage des sols et surfaces'),
  ('Rangement', '📦', 'Organisation et rangement'),
  ('Courses & Gestion', '🛒', 'Courses et gestion du foyer')
ON CONFLICT (name) DO NOTHING;

-- Get category IDs (will be used in INSERTs)
DO $$
DECLARE
  cat_cuisine UUID;
  cat_sanitaire UUID;
  cat_textile UUID;
  cat_salon UUID;
  cat_exterieur UUID;
  cat_sols UUID;
  cat_rangement UUID;
  cat_courses UUID;
BEGIN
  -- Fetch category IDs
  SELECT id INTO cat_cuisine FROM categories WHERE name = 'Cuisine & Vaisselle';
  SELECT id INTO cat_sanitaire FROM categories WHERE name = 'Sanitaire';
  SELECT id INTO cat_textile FROM categories WHERE name = 'Textile';
  SELECT id INTO cat_salon FROM categories WHERE name = 'Salon & Espaces Communs';
  SELECT id INTO cat_exterieur FROM categories WHERE name = 'Extérieur & Plantes';
  SELECT id INTO cat_sols FROM categories WHERE name = 'Sols & Surfaces';
  SELECT id INTO cat_rangement FROM categories WHERE name = 'Rangement';
  SELECT id INTO cat_courses FROM categories WHERE name = 'Courses & Gestion';

  -- Insert task templates
  -- CUISINE & VAISSELLE
  INSERT INTO task_templates (name, description, base_points, estimated_duration, category_id, icon) VALUES
    ('Faire la vaisselle', 'Laver et ranger la vaisselle', 50, 20, cat_cuisine, '🍽️'),
    ('Nettoyer le plan de travail', 'Nettoyer et désinfecter le plan de travail de la cuisine', 30, 10, cat_cuisine, '✨'),
    ('Nettoyer la plaque de cuisson', 'Nettoyer les plaques et brûleurs', 40, 15, cat_cuisine, '🔥'),
    ('Nettoyer le four', 'Nettoyage en profondeur du four', 100, 45, cat_cuisine, '🔥'),
    ('Vider le lave-vaisselle', 'Vider et ranger la vaisselle propre', 20, 10, cat_cuisine, '🍽️'),
    ('Sortir les poubelles', 'Sortir les poubelles et mettre un nouveau sac', 30, 10, cat_cuisine, '🗑️'),
    ('Nettoyer le réfrigérateur', 'Nettoyer et organiser le réfrigérateur', 80, 30, cat_cuisine, '❄️')
  ON CONFLICT (name) DO NOTHING;

  -- SANITAIRE
  INSERT INTO task_templates (name, description, base_points, estimated_duration, category_id, icon) VALUES
    ('Nettoyer les toilettes', 'Nettoyer et désinfecter les toilettes', 60, 15, cat_sanitaire, '🚽'),
    ('Nettoyer la salle de bain', 'Nettoyer lavabo, baignoire et surfaces', 70, 25, cat_sanitaire, '🚿'),
    ('Nettoyer la douche', 'Nettoyer parois, robinetterie et sol de douche', 50, 20, cat_sanitaire, '🚿'),
    ('Nettoyer les miroirs', 'Nettoyer les miroirs sans traces', 20, 10, cat_sanitaire, '🪞')
  ON CONFLICT (name) DO NOTHING;

  -- TEXTILE
  INSERT INTO task_templates (name, description, base_points, estimated_duration, category_id, icon) VALUES
    ('Faire une machine de linge', 'Lancer et étendre une machine', 40, 15, cat_textile, '🧺'),
    ('Étendre le linge', 'Étendre le linge sur un étendoir ou dehors', 30, 15, cat_textile, '👕'),
    ('Plier et ranger le linge', 'Plier et ranger le linge propre', 50, 25, cat_textile, '👔'),
    ('Repasser le linge', 'Repasser le linge qui en a besoin', 60, 30, cat_textile, '👔'),
    ('Changer les draps', 'Changer et laver les draps du lit', 50, 20, cat_textile, '🛏️')
  ON CONFLICT (name) DO NOTHING;

  -- SALON & ESPACES COMMUNS
  INSERT INTO task_templates (name, description, base_points, estimated_duration, category_id, icon) VALUES
    ('Passer l''aspirateur', 'Aspirer tous les sols et tapis', 60, 25, cat_salon, '🧹'),
    ('Enlever les poils d''animaux', 'Enlever les poils sur les meubles et sols', 40, 20, cat_salon, '🐕'),
    ('Dépoussiérer les meubles', 'Dépoussiérer toutes les surfaces', 40, 20, cat_salon, '✨'),
    ('Aérer les pièces', 'Ouvrir les fenêtres pour aérer', 10, 5, cat_salon, '🌬️'),
    ('Ranger les jouets', 'Ranger les jouets des enfants', 30, 15, cat_salon, '🧸')
  ON CONFLICT (name) DO NOTHING;

  -- EXTÉRIEUR & PLANTES
  INSERT INTO task_templates (name, description, base_points, estimated_duration, category_id, icon) VALUES
    ('Tondre la pelouse', 'Tondre et entretenir la pelouse', 100, 60, cat_exterieur, '🌱'),
    ('Désherber', 'Enlever les mauvaises herbes', 80, 45, cat_exterieur, '🌿'),
    ('Arroser les plantes', 'Arroser toutes les plantes', 30, 15, cat_exterieur, '💧'),
    ('Nettoyer le balcon/terrasse', 'Balayer et nettoyer le balcon ou la terrasse', 50, 20, cat_exterieur, '🧹')
  ON CONFLICT (name) DO NOTHING;

  -- SOLS & SURFACES
  INSERT INTO task_templates (name, description, base_points, estimated_duration, category_id, icon) VALUES
    ('Passer la serpillière', 'Laver tous les sols', 70, 30, cat_sols, '🧽'),
    ('Nettoyer les vitres', 'Nettoyer les vitres intérieures et extérieures', 80, 40, cat_sols, '🪟')
  ON CONFLICT (name) DO NOTHING;

  -- RANGEMENT
  INSERT INTO task_templates (name, description, base_points, estimated_duration, category_id, icon) VALUES
    ('Ranger le salon', 'Ranger et organiser le salon', 40, 20, cat_rangement, '🛋️'),
    ('Ranger la cuisine', 'Ranger et organiser la cuisine', 40, 20, cat_rangement, '🍽️'),
    ('Ranger la chambre', 'Ranger et organiser la chambre', 40, 20, cat_rangement, '🛏️')
  ON CONFLICT (name) DO NOTHING;

  -- COURSES & GESTION
  INSERT INTO task_templates (name, description, base_points, estimated_duration, category_id, icon) VALUES
    ('Faire les courses', 'Faire les courses pour le foyer', 80, 60, cat_courses, '🛒'),
    ('Planifier les repas', 'Planifier les repas de la semaine', 50, 30, cat_courses, '📋'),
    ('Vérifier les dates de péremption', 'Vérifier et jeter les produits périmés', 20, 15, cat_courses, '📅')
  ON CONFLICT (name) DO NOTHING;
END $$;

-- Verify the result
SELECT
  c.name as category,
  COUNT(tt.id) as task_count
FROM categories c
LEFT JOIN task_templates tt ON c.id = tt.category_id
GROUP BY c.name
ORDER BY c.name;

-- Show all templates
SELECT
  tt.name,
  tt.base_points,
  tt.estimated_duration,
  c.name as category
FROM task_templates tt
JOIN categories c ON tt.category_id = c.id
ORDER BY c.name, tt.name;
