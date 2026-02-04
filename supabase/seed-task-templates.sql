-- Seed script for task_templates
-- This script populates the task_templates table with all tasks referenced by the questionnaire system
-- Note: Categories and frequencies are already populated by schema.sql

-- Get category IDs and frequency ID (will be used in INSERTs)
DO $$
DECLARE
  cat_cuisine UUID;
  cat_sanitaire UUID;
  cat_buanderie UUID;
  cat_salon UUID;
  cat_exterieur UUID;
  cat_general UUID;
  cat_chambre UUID;
  cat_entree UUID;
  freq_weekly UUID;
  freq_daily UUID;
BEGIN
  -- Fetch category IDs from existing categories in schema.sql
  SELECT id INTO cat_cuisine FROM categories WHERE name = 'Cuisine';
  SELECT id INTO cat_sanitaire FROM categories WHERE name = 'Salle de bain';
  SELECT id INTO cat_buanderie FROM categories WHERE name = 'Buanderie';
  SELECT id INTO cat_salon FROM categories WHERE name = 'Salon';
  SELECT id INTO cat_exterieur FROM categories WHERE name = 'Extérieur';
  SELECT id INTO cat_general FROM categories WHERE name = 'Général';
  SELECT id INTO cat_chambre FROM categories WHERE name = 'Chambre';
  SELECT id INTO cat_entree FROM categories WHERE name = 'Entrée';

  -- Fetch frequency IDs from existing frequencies in schema.sql
  SELECT id INTO freq_weekly FROM frequencies WHERE code = 'weekly';
  SELECT id INTO freq_daily FROM frequencies WHERE code = 'daily';

  -- Insert task templates
  -- CUISINE
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Faire la vaisselle', 20, 2, 50, cat_cuisine, freq_daily, '🍽️', 'Laver et ranger la vaisselle'),
    ('Nettoyer le plan de travail', 10, 1, 30, cat_cuisine, freq_daily, '✨', 'Nettoyer et désinfecter le plan de travail de la cuisine'),
    ('Nettoyer la plaque de cuisson', 15, 2, 40, cat_cuisine, freq_weekly, '🔥', 'Nettoyer les plaques et brûleurs'),
    ('Nettoyer le four', 45, 4, 100, cat_cuisine, freq_weekly, '🔥', 'Nettoyage en profondeur du four'),
    ('Vider le lave-vaisselle', 10, 1, 20, cat_cuisine, freq_daily, '🍽️', 'Vider et ranger la vaisselle propre'),
    ('Sortir les poubelles', 10, 1, 30, cat_cuisine, freq_daily, '🗑️', 'Sortir les poubelles et mettre un nouveau sac'),
    ('Nettoyer le réfrigérateur', 30, 3, 80, cat_cuisine, freq_weekly, '❄️', 'Nettoyer et organiser le réfrigérateur');

  -- SALLE DE BAIN
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Nettoyer les toilettes', 15, 2, 60, cat_sanitaire, freq_weekly, '🚽', 'Nettoyer et désinfecter les toilettes'),
    ('Nettoyer la salle de bain', 25, 3, 70, cat_sanitaire, freq_weekly, '🚿', 'Nettoyer lavabo, baignoire et surfaces'),
    ('Nettoyer la douche', 20, 3, 50, cat_sanitaire, freq_weekly, '🚿', 'Nettoyer parois, robinetterie et sol de douche'),
    ('Nettoyer les miroirs', 10, 1, 20, cat_sanitaire, freq_weekly, '🪞', 'Nettoyer les miroirs sans traces')
;

  -- BUANDERIE
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Faire une machine de linge', 15, 2, 40, cat_buanderie, freq_weekly, '🧺', 'Lancer et étendre une machine'),
    ('Étendre le linge', 15, 1, 30, cat_buanderie, freq_weekly, '👕', 'Étendre le linge sur un étendoir ou dehors'),
    ('Plier et ranger le linge', 25, 2, 50, cat_buanderie, freq_weekly, '👔', 'Plier et ranger le linge propre'),
    ('Repasser le linge', 30, 3, 60, cat_buanderie, freq_weekly, '👔', 'Repasser le linge qui en a besoin'),
    ('Changer les draps', 20, 2, 50, cat_chambre, freq_weekly, '🛏️', 'Changer et laver les draps du lit')
;

  -- SALON
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Passer l''aspirateur', 25, 2, 60, cat_salon, freq_weekly, '🧹', 'Aspirer tous les sols et tapis'),
    ('Enlever les poils d''animaux', 20, 2, 40, cat_salon, freq_weekly, '🐕', 'Enlever les poils sur les meubles et sols'),
    ('Dépoussiérer les meubles', 20, 1, 40, cat_salon, freq_weekly, '✨', 'Dépoussiérer toutes les surfaces'),
    ('Aérer les pièces', 5, 1, 10, cat_general, freq_daily, '🌬️', 'Ouvrir les fenêtres pour aérer'),
    ('Ranger les jouets', 15, 1, 30, cat_salon, freq_daily, '🧸', 'Ranger les jouets des enfants')
;

  -- EXTÉRIEUR
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Tondre la pelouse', 60, 4, 100, cat_exterieur, freq_weekly, '🌱', 'Tondre et entretenir la pelouse'),
    ('Désherber', 45, 3, 80, cat_exterieur, freq_weekly, '🌿', 'Enlever les mauvaises herbes'),
    ('Arroser les plantes', 15, 1, 30, cat_exterieur, freq_weekly, '💧', 'Arroser toutes les plantes'),
    ('Nettoyer le balcon/terrasse', 20, 2, 50, cat_exterieur, freq_weekly, '🧹', 'Balayer et nettoyer le balcon ou la terrasse')
;

  -- GÉNÉRAL (sols et surfaces)
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Passer la serpillière', 30, 3, 70, cat_general, freq_weekly, '🧽', 'Laver tous les sols'),
    ('Nettoyer les vitres', 40, 3, 80, cat_general, freq_weekly, '🪟', 'Nettoyer les vitres intérieures et extérieures')
;

  -- RANGEMENT
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Ranger le salon', 20, 2, 40, cat_salon, freq_weekly, '🛋️', 'Ranger et organiser le salon'),
    ('Ranger la cuisine', 20, 2, 40, cat_cuisine, freq_weekly, '🍽️', 'Ranger et organiser la cuisine'),
    ('Ranger la chambre', 20, 2, 40, cat_chambre, freq_weekly, '🛏️', 'Ranger et organiser la chambre')
;

  -- GÉNÉRAL (courses & gestion)
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Faire les courses', 60, 3, 80, cat_general, freq_weekly, '🛒', 'Faire les courses pour le foyer'),
    ('Planifier les repas', 30, 2, 50, cat_general, freq_weekly, '📋', 'Planifier les repas de la semaine'),
    ('Vérifier les dates de péremption', 15, 1, 20, cat_general, freq_weekly, '📅', 'Vérifier et jeter les produits périmés')
;
END $$;

-- Verify the result
SELECT
  c.name as category,
  c.emoji,
  COUNT(tt.id) as task_count
FROM categories c
LEFT JOIN task_templates tt ON c.id = tt.category_id
GROUP BY c.name, c.emoji, c.display_order
ORDER BY c.display_order;

-- Show all templates
SELECT
  tt.name,
  tt.base_points,
  tt.duration_minutes,
  tt.difficulty,
  tt.icon,
  c.name as category
FROM task_templates tt
JOIN categories c ON tt.category_id = c.id
ORDER BY c.display_order, tt.name;
