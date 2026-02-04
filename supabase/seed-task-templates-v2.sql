-- ============================================
-- SEED TASK TEMPLATES V2 - EXPANSION MASSIVE
-- ============================================
-- Objectif: Passer de 33 à ~145 tâches détaillées
-- Version: 2.0
-- Date: 2026-02-04
--
-- IMPORTANT: Ce script REMPLACE les tâches existantes
-- Pour ajouter sans supprimer, utilisez INSERT avec ON CONFLICT DO NOTHING

-- Vider les tâches existantes (optionnel - commentez si vous voulez garder les anciennes)
-- DELETE FROM task_templates;

-- Récupérer les IDs des catégories et fréquences
DO $$
DECLARE
  cat_cuisine UUID;
  cat_sanitaire UUID;
  cat_chambre UUID;
  cat_salon UUID;
  cat_entree UUID;
  cat_buanderie UUID;
  cat_exterieur UUID;
  cat_general UUID;
  cat_animaux UUID;
  cat_enfants UUID;
  cat_saisonnier UUID;

  freq_daily UUID;
  freq_2_3x_week UUID;
  freq_weekly UUID;
  freq_biweekly UUID;
  freq_monthly UUID;
  freq_quarterly UUID;
  freq_biannual UUID;
  freq_annual UUID;
  freq_seasonal UUID;
BEGIN
  -- Fetch category IDs
  SELECT id INTO cat_cuisine FROM categories WHERE name = 'Cuisine';
  SELECT id INTO cat_sanitaire FROM categories WHERE name = 'Salle de bain';
  SELECT id INTO cat_chambre FROM categories WHERE name = 'Chambre';
  SELECT id INTO cat_salon FROM categories WHERE name = 'Salon';
  SELECT id INTO cat_entree FROM categories WHERE name = 'Entrée';
  SELECT id INTO cat_buanderie FROM categories WHERE name = 'Buanderie';
  SELECT id INTO cat_exterieur FROM categories WHERE name = 'Extérieur';
  SELECT id INTO cat_general FROM categories WHERE name = 'Général';
  SELECT id INTO cat_animaux FROM categories WHERE name = 'Animaux';
  SELECT id INTO cat_enfants FROM categories WHERE name = 'Enfants';
  SELECT id INTO cat_saisonnier FROM categories WHERE name = 'Saisonnier';

  -- Fetch frequency IDs
  SELECT id INTO freq_daily FROM frequencies WHERE code = 'daily';
  SELECT id INTO freq_2_3x_week FROM frequencies WHERE code = '2-3x_week';
  SELECT id INTO freq_weekly FROM frequencies WHERE code = 'weekly';
  SELECT id INTO freq_biweekly FROM frequencies WHERE code = 'biweekly';
  SELECT id INTO freq_monthly FROM frequencies WHERE code = 'monthly';
  SELECT id INTO freq_quarterly FROM frequencies WHERE code = 'quarterly';
  SELECT id INTO freq_biannual FROM frequencies WHERE code = 'biannual';
  SELECT id INTO freq_annual FROM frequencies WHERE code = 'annual';
  SELECT id INTO freq_seasonal FROM frequencies WHERE code = 'seasonal';

  -- ============================================
  -- CUISINE (25 tâches)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    -- Quotidiennes
    ('Faire la vaisselle', 20, 2, 50, cat_cuisine, freq_daily, '🍽️', 'Laver et ranger la vaisselle après les repas'),
    ('Nettoyer le plan de travail', 10, 1, 30, cat_cuisine, freq_daily, '✨', 'Essuyer et désinfecter les surfaces de travail'),
    ('Vider le lave-vaisselle', 10, 1, 20, cat_cuisine, freq_daily, '🍽️', 'Ranger la vaisselle propre aux bonnes places'),
    ('Sortir les poubelles', 10, 1, 30, cat_cuisine, freq_daily, '🗑️', 'Vider les poubelles et mettre un nouveau sac'),

    -- Hebdomadaires
    ('Nettoyer la plaque de cuisson', 15, 2, 40, cat_cuisine, freq_weekly, '🔥', 'Dégraisser les plaques et brûleurs'),
    ('Nettoyer l''évier et robinetterie', 10, 1, 25, cat_cuisine, freq_weekly, '💧', 'Faire briller l''évier et les robinets'),
    ('Vider et nettoyer la poubelle', 10, 2, 30, cat_cuisine, freq_weekly, '🗑️', 'Laver les bacs à poubelle'),
    ('Nettoyer le micro-ondes', 10, 1, 25, cat_cuisine, freq_weekly, '📻', 'Enlever les projections et désinfecter'),

    -- Mensuelles
    ('Nettoyer le four', 45, 4, 100, cat_cuisine, freq_monthly, '🔥', 'Nettoyage en profondeur du four et grilles'),
    ('Nettoyer le réfrigérateur', 30, 3, 80, cat_cuisine, freq_monthly, '❄️', 'Nettoyer et organiser le réfrigérateur'),
    ('Nettoyer les joints du réfrigérateur', 15, 2, 35, cat_cuisine, freq_monthly, '❄️', 'Désinfecter les joints de porte'),
    ('Nettoyer le lave-vaisselle', 20, 2, 40, cat_cuisine, freq_monthly, '🍽️', 'Nettoyer filtre, joints et intérieur'),
    ('Détartrer la cafetière/bouilloire', 20, 2, 35, cat_cuisine, freq_monthly, '☕', 'Détartrer avec vinaigre blanc'),
    ('Organiser les placards', 30, 2, 50, cat_cuisine, freq_monthly, '📦', 'Ranger et vérifier les dates de péremption'),
    ('Nettoyer les grilles du four', 30, 3, 60, cat_cuisine, freq_monthly, '🔥', 'Dégraisser les grilles en profondeur'),
    ('Dégraisser la hotte', 25, 3, 55, cat_cuisine, freq_monthly, '🌬️', 'Nettoyer filtre et surfaces de la hotte'),
    ('Détartrer l''évier', 15, 2, 30, cat_cuisine, freq_monthly, '💧', 'Enlever le calcaire de l''évier'),
    ('Nettoyer les poignées de placards', 15, 1, 25, cat_cuisine, freq_monthly, '🚪', 'Dégraisser toutes les poignées'),
    ('Nettoyer les bouches de VMC', 15, 2, 35, cat_cuisine, freq_monthly, '🌬️', 'Dépoussiérer les grilles d''aération'),

    -- Trimestrielles
    ('Dégivrer le congélateur', 45, 3, 80, cat_cuisine, freq_quarterly, '❄️', 'Vider, dégivrer et nettoyer le congélateur'),
    ('Nettoyer derrière les électroménagers', 45, 4, 90, cat_cuisine, freq_quarterly, '🧹', 'Déplacer et nettoyer derrière frigo, four, etc.'),

    -- Plan de travail profond mensuel
    ('Nettoyer plan de travail - profond', 20, 2, 45, cat_cuisine, freq_monthly, '✨', 'Nettoyage en profondeur et désinfection complète');

  -- ============================================
  -- SALLE DE BAIN (18 tâches)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    -- Quotidiennes
    ('Aérer la salle de bain', 5, 1, 10, cat_sanitaire, freq_daily, '🌬️', 'Ouvrir la fenêtre pour éviter l''humidité'),

    -- Hebdomadaires
    ('Nettoyer les toilettes', 15, 2, 60, cat_sanitaire, freq_weekly, '🚽', 'Désinfecter la cuvette, l''abattant et l''extérieur'),
    ('Nettoyer la salle de bain', 25, 3, 70, cat_sanitaire, freq_weekly, '🚿', 'Lavabo, baignoire, surfaces et sol'),
    ('Nettoyer la douche', 20, 3, 50, cat_sanitaire, freq_weekly, '🚿', 'Parois, robinetterie et sol de douche'),
    ('Nettoyer les miroirs', 10, 1, 20, cat_sanitaire, freq_weekly, '🪞', 'Faire briller sans traces'),
    ('Nettoyer le meuble de salle de bain', 15, 1, 30, cat_sanitaire, freq_weekly, '🚪', 'Essuyer et ranger le meuble'),
    ('Laver les tapis de bain', 10, 1, 20, cat_sanitaire, freq_weekly, '🧺', 'Laver les tapis en machine'),
    ('Désinfecter poignées et interrupteurs', 5, 1, 15, cat_sanitaire, freq_weekly, '🚪', 'Nettoyer tous les points de contact'),

    -- Mensuelles
    ('Nettoyer les joints de carrelage', 30, 3, 65, cat_sanitaire, freq_monthly, '🧽', 'Détacher et désinfecter les joints'),
    ('Détartrer les robinets', 15, 2, 35, cat_sanitaire, freq_monthly, '💧', 'Enlever le calcaire des robinets'),
    ('Nettoyer la VMC/extracteur', 15, 2, 35, cat_sanitaire, freq_monthly, '🌬️', 'Nettoyer grille et ventilateur'),
    ('Nettoyer le rideau de douche', 20, 2, 40, cat_sanitaire, freq_monthly, '🚿', 'Laver ou remplacer le rideau'),
    ('Nettoyer les canalisations', 10, 2, 30, cat_sanitaire, freq_monthly, '🚰', 'Enlever cheveux et résidus'),
    ('Nettoyer le pommeau de douche', 15, 2, 30, cat_sanitaire, freq_monthly, '🚿', 'Détartrer le pommeau'),
    ('Organiser les produits', 20, 1, 25, cat_sanitaire, freq_monthly, '📦', 'Trier et ranger les produits'),
    ('Détartrer baignoire/douche', 25, 3, 55, cat_sanitaire, freq_monthly, '🚿', 'Traitement anti-calcaire complet'),
    ('Nettoyer sèche-serviettes/radiateur', 15, 2, 30, cat_sanitaire, freq_monthly, '🔥', 'Dépoussiérer et nettoyer'),

    -- Trimestrielles
    ('Nettoyer baignoire en profondeur', 30, 3, 60, cat_sanitaire, freq_quarterly, '🛁', 'Grand nettoyage de la baignoire');

  -- ============================================
  -- CHAMBRE (15 tâches)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    -- Quotidiennes
    ('Aérer la chambre', 5, 1, 10, cat_chambre, freq_daily, '🌬️', 'Ouvrir la fenêtre 10 minutes'),

    -- Hebdomadaires
    ('Changer les draps', 20, 2, 50, cat_chambre, freq_weekly, '🛏️', 'Changer et laver la literie'),
    ('Nettoyer miroirs de placard', 10, 1, 20, cat_chambre, freq_weekly, '🪞', 'Faire briller les miroirs'),
    ('Dépoussiérer les étagères', 15, 1, 25, cat_chambre, freq_weekly, '✨', 'Enlever la poussière des étagères'),

    -- Mensuelles
    ('Passer l''aspirateur sous le lit', 15, 2, 35, cat_chambre, freq_monthly, '🧹', 'Nettoyer sous et autour du lit'),
    ('Dépoussiérer les plinthes', 20, 2, 35, cat_chambre, freq_monthly, '✨', 'Toutes les plinthes de la chambre'),
    ('Nettoyer interrupteurs/prises', 10, 1, 20, cat_chambre, freq_monthly, '🔌', 'Dégraisser les interrupteurs'),
    ('Aspirer le matelas', 20, 2, 40, cat_chambre, freq_monthly, '🛏️', 'Aspirer le matelas contre les acariens'),
    ('Nettoyer lampes de chevet', 10, 1, 20, cat_chambre, freq_monthly, '💡', 'Dépoussiérer les lampes'),
    ('Ranger tiroirs/placards', 30, 2, 45, cat_chambre, freq_monthly, '📦', 'Organiser et trier'),
    ('Trier les vêtements', 45, 2, 50, cat_chambre, freq_monthly, '👕', 'Tri et don des vêtements inutilisés'),
    ('Nettoyer volets/stores', 20, 2, 35, cat_chambre, freq_monthly, '🪟', 'Dépoussiérer volets et stores'),

    -- Trimestrielles
    ('Retourner le matelas', 15, 2, 30, cat_chambre, freq_quarterly, '🛏️', 'Retourner pour usure uniforme'),
    ('Laver les oreillers', 30, 2, 40, cat_chambre, freq_quarterly, '🛏️', 'Lavage en machine si possible'),
    ('Laver couvertures/couettes', 30, 2, 45, cat_chambre, freq_quarterly, '🛏️', 'Grand nettoyage de la literie');

  -- ============================================
  -- SALON (8 tâches - existantes améliorées)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Passer l''aspirateur - salon', 25, 2, 60, cat_salon, freq_weekly, '🧹', 'Aspirer sols et tapis du salon'),
    ('Enlever les poils d''animaux', 20, 2, 40, cat_salon, freq_2_3x_week, '🐕', 'Enlever poils sur meubles et sols'),
    ('Dépoussiérer les meubles - salon', 20, 1, 40, cat_salon, freq_weekly, '✨', 'Toutes les surfaces du salon'),
    ('Ranger le salon', 20, 2, 40, cat_salon, freq_weekly, '🛋️', 'Ranger et organiser le salon'),
    ('Ranger les jouets', 15, 1, 30, cat_salon, freq_daily, '🧸', 'Ranger les jouets des enfants'),
    ('Nettoyer le canapé', 30, 3, 55, cat_salon, freq_monthly, '🛋️', 'Aspirer et détacher le canapé'),
    ('Nettoyer les coussins', 20, 2, 35, cat_salon, freq_monthly, '🛋️', 'Laver les housses si possible'),
    ('Aérer le salon', 5, 1, 10, cat_salon, freq_daily, '🌬️', 'Ouvrir les fenêtres');

  -- ============================================
  -- BUANDERIE (5 tâches)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Faire une machine de linge', 15, 2, 40, cat_buanderie, freq_2_3x_week, '🧺', 'Lancer et programmer la machine'),
    ('Étendre le linge', 15, 1, 30, cat_buanderie, freq_2_3x_week, '👕', 'Étendre correctement pour éviter plis'),
    ('Plier et ranger le linge', 25, 2, 50, cat_buanderie, freq_weekly, '👔', 'Plier et ranger aux bonnes places'),
    ('Repasser le linge', 30, 3, 60, cat_buanderie, freq_weekly, '👔', 'Repasser ce qui en a besoin'),
    ('Nettoyer le lave-linge', 20, 2, 40, cat_buanderie, freq_monthly, '🧺', 'Nettoyer filtre et joints');

  -- ============================================
  -- ENTRÉE (12 tâches - NOUVELLES)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Nettoyer le paillasson', 5, 1, 15, cat_entree, freq_weekly, '🚪', 'Secouer ou aspirer le paillasson'),
    ('Laver les sols de l''entrée', 10, 2, 30, cat_entree, freq_weekly, '🧽', 'Nettoyer le sol de l''entrée'),
    ('Ranger les chaussures', 10, 1, 20, cat_entree, freq_weekly, '👞', 'Organiser le rangement chaussures'),
    ('Aspirer le couloir', 10, 1, 25, cat_entree, freq_weekly, '🧹', 'Aspirer couloir et entrée'),
    ('Nettoyer poignée de porte', 5, 1, 15, cat_entree, freq_weekly, '🚪', 'Désinfecter la poignée principale'),
    ('Organiser accessoires', 10, 1, 20, cat_entree, freq_weekly, '🔑', 'Ranger clés, courrier, etc.'),
    ('Trier et jeter le courrier', 10, 1, 20, cat_entree, freq_weekly, '📬', 'Trier pub et papiers inutiles'),
    ('Nettoyer les chaussures', 20, 2, 30, cat_entree, freq_monthly, '👞', 'Cirer et entretenir les chaussures'),
    ('Dépoussiérer porte-manteau', 10, 1, 15, cat_entree, freq_monthly, '🧥', 'Nettoyer le porte-manteau'),
    ('Nettoyer la porte d''entrée', 15, 2, 30, cat_entree, freq_monthly, '🚪', 'Intérieur et extérieur de la porte'),
    ('Nettoyer les interrupteurs', 5, 1, 10, cat_entree, freq_monthly, '💡', 'Essuyer les interrupteurs'),
    ('Nettoyer les plinthes', 15, 2, 25, cat_entree, freq_monthly, '✨', 'Dépoussiérer les plinthes');

  -- ============================================
  -- EXTÉRIEUR (4 tâches)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Tondre la pelouse', 60, 4, 100, cat_exterieur, freq_weekly, '🌱', 'Tondre et ramasser l''herbe'),
    ('Désherber', 45, 3, 80, cat_exterieur, freq_biweekly, '🌿', 'Enlever les mauvaises herbes'),
    ('Arroser les plantes', 15, 1, 30, cat_exterieur, freq_weekly, '💧', 'Arroser plantes et jardin'),
    ('Nettoyer balcon/terrasse', 20, 2, 50, cat_exterieur, freq_weekly, '🧹', 'Balayer et nettoyer');

  -- ============================================
  -- GÉNÉRAL (20 tâches)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    -- Quotidiennes
    ('Aérer toutes les pièces', 10, 1, 15, cat_general, freq_daily, '🌬️', 'Ouvrir toutes les fenêtres 10-15min'),

    -- Hebdomadaires
    ('Passer la serpillière', 30, 3, 70, cat_general, freq_weekly, '🧽', 'Laver tous les sols'),
    ('Nettoyer les vitres', 40, 3, 80, cat_general, freq_biweekly, '🪟', 'Intérieur et extérieur'),
    ('Nettoyer poignées de porte', 10, 1, 20, cat_general, freq_weekly, '🚪', 'Toutes les poignées'),
    ('Trier et recycler', 15, 1, 25, cat_general, freq_weekly, '♻️', 'Tri sélectif et recyclage'),
    ('Faire les courses', 60, 3, 80, cat_general, freq_weekly, '🛒', 'Courses pour le foyer'),
    ('Planifier les repas', 30, 2, 50, cat_general, freq_weekly, '📋', 'Menu de la semaine'),
    ('Vérifier dates de péremption', 15, 1, 20, cat_general, freq_weekly, '📅', 'Jeter les produits périmés'),

    -- Mensuelles
    ('Nettoyer tous les interrupteurs', 20, 1, 30, cat_general, freq_monthly, '💡', 'Tous les interrupteurs du logement'),
    ('Dépoussiérer toutes plinthes', 30, 2, 45, cat_general, freq_monthly, '✨', 'Toutes les plinthes'),
    ('Nettoyer les portes', 20, 2, 35, cat_general, freq_monthly, '🚪', 'Toutes les portes du logement'),
    ('Remplacer sacs aspirateur', 5, 1, 10, cat_general, freq_monthly, '🧹', 'Changer le sac si nécessaire'),
    ('Nettoyer filtres aspirateur', 15, 2, 25, cat_general, freq_monthly, '🧹', 'Laver les filtres'),
    ('Descendre toiles d''araignée', 20, 2, 30, cat_general, freq_monthly, '🕷️', 'Plafonds et coins'),
    ('Nettoyer les luminaires', 30, 3, 50, cat_general, freq_monthly, '💡', 'Dépoussiérer toutes les lampes'),
    ('Organiser papiers administratifs', 30, 2, 40, cat_general, freq_monthly, '📄', 'Trier et classer les papiers'),
    ('Vérifier détecteurs de fumée', 5, 1, 15, cat_general, freq_monthly, '🔥', 'Tester les détecteurs'),

    -- Trimestrielles
    ('Nettoyer derrière les meubles', 60, 4, 90, cat_general, freq_quarterly, '🧹', 'Grand nettoyage derrière meubles'),
    ('Remplacer les ampoules', 10, 1, 15, cat_general, freq_quarterly, '💡', 'Vérifier et remplacer si besoin'),

    -- Passer aspirateur général non assigné à une pièce
    ('Passer l''aspirateur - général', 25, 2, 60, cat_general, freq_weekly, '🧹', 'Aspirer toutes les pièces');

  -- ============================================
  -- ANIMAUX (10 tâches - NOUVELLES)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    -- Quotidiennes
    ('Changer la litière du chat', 10, 1, 25, cat_animaux, freq_daily, '🐱', 'Enlever les déjections quotidiennement'),
    ('Laver les gamelles', 5, 1, 15, cat_animaux, freq_daily, '🍽️', 'Nettoyer les gamelles eau et nourriture'),
    ('Nettoyer autour litière/cage', 5, 1, 15, cat_animaux, freq_daily, '🧹', 'Balayer autour de la litière'),

    -- Hebdomadaires
    ('Nettoyer bac à litière profond', 20, 2, 40, cat_animaux, freq_weekly, '🐱', 'Vider et laver le bac complètement'),
    ('Laver panier/coussin animal', 15, 2, 30, cat_animaux, freq_weekly, '🛏️', 'Laver la literie de l''animal'),
    ('Aspirer poils sur canapé', 15, 2, 35, cat_animaux, freq_2_3x_week, '🐕', 'Enlever les poils des meubles'),
    ('Nettoyer jouets de l''animal', 10, 1, 20, cat_animaux, freq_weekly, '🎾', 'Laver les jouets'),
    ('Laver plaids/couvertures à poils', 20, 2, 35, cat_animaux, freq_weekly, '🧺', 'Laver les textiles avec poils'),
    ('Nettoyer la cage', 30, 2, 45, cat_animaux, freq_weekly, '🐹', 'Pour rongeurs/oiseaux'),
    ('Brosser l''animal', 20, 2, 30, cat_animaux, freq_weekly, '🐕', 'Brossage régulier');

  -- ============================================
  -- ENFANTS (10 tâches - NOUVELLES)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    -- Quotidiennes
    ('Ranger jouets dans les bacs', 15, 1, 25, cat_enfants, freq_daily, '🧸', 'Ranger les jouets éparpillés'),
    ('Nettoyer la chaise haute', 10, 1, 20, cat_enfants, freq_daily, '🪑', 'Après chaque repas'),
    ('Désinfecter table à langer', 5, 1, 15, cat_enfants, freq_daily, '🍼', 'Nettoyer après chaque change'),

    -- 2-3x/semaine
    ('Changer linge de lit bébé', 20, 2, 35, cat_enfants, freq_2_3x_week, '🛏️', 'Literie du berceau/lit bébé'),

    -- Hebdomadaires
    ('Nettoyer les jouets', 20, 2, 30, cat_enfants, freq_weekly, '🧸', 'Laver/désinfecter les jouets'),
    ('Nettoyer parc/tapis d''éveil', 15, 2, 30, cat_enfants, freq_weekly, '🎮', 'Nettoyer les aires de jeu'),
    ('Ranger livres et jeux', 15, 1, 25, cat_enfants, freq_weekly, '📚', 'Organiser bibliothèque enfant'),

    -- Mensuelles
    ('Laver les peluches', 30, 2, 40, cat_enfants, freq_monthly, '🧸', 'Lavage en machine si possible'),
    ('Organiser vêtements enfants', 30, 2, 40, cat_enfants, freq_monthly, '👕', 'Trier par taille et saison'),
    ('Trier dessins et créations', 20, 1, 25, cat_enfants, freq_monthly, '🎨', 'Garder les plus beaux');

  -- ============================================
  -- SAISONNIER (15 tâches - NOUVELLES)
  -- ============================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, icon, tip) VALUES
    ('Ranger vêtements hiver/été', 120, 3, 100, cat_saisonnier, freq_seasonal, '👕', 'Changement de garde-robe saisonnier'),
    ('Nettoyer radiateurs avant hiver', 45, 3, 70, cat_saisonnier, freq_annual, '🔥', 'Dépoussiérer avant utilisation'),
    ('Nettoyer ventilateurs/clim été', 30, 2, 50, cat_saisonnier, freq_annual, '❄️', 'Préparer pour l''été'),
    ('Nettoyer les gouttières', 60, 4, 90, cat_saisonnier, freq_annual, '🏠', 'Enlever feuilles et débris'),
    ('Vérifier joints de fenêtres', 30, 2, 45, cat_saisonnier, freq_annual, '🪟', 'Contrôle avant hiver'),
    ('Nettoyer volets extérieurs', 45, 3, 65, cat_saisonnier, freq_annual, '🏠', 'Grand nettoyage annuel'),
    ('Entretien plantes intérieur', 60, 2, 55, cat_saisonnier, freq_seasonal, '🌱', 'Rempotage et taille printemps'),
    ('Tailler les haies', 90, 3, 85, cat_saisonnier, freq_seasonal, '🌿', 'Taille saisonnière'),
    ('Nettoyer le barbecue', 30, 3, 50, cat_saisonnier, freq_annual, '🔥', 'Avant la saison été'),
    ('Ranger mobilier de jardin', 45, 2, 55, cat_saisonnier, freq_annual, '🪑', 'Protection pour l''hiver'),
    ('Nettoyer les moustiquaires', 30, 2, 40, cat_saisonnier, freq_annual, '🪟', 'Avant l''été'),
    ('Vérifier l''isolation', 45, 3, 60, cat_saisonnier, freq_annual, '🏠', 'Contrôle automne'),
    ('Nettoyer abords de la maison', 60, 3, 70, cat_saisonnier, freq_seasonal, '🏠', 'Nettoyage printemps'),
    ('Préparer jardin pour hiver', 90, 3, 80, cat_saisonnier, freq_annual, '🌿', 'Protection des plantes'),
    ('Déneiger entrée/balcon', 30, 2, 45, cat_saisonnier, freq_seasonal, '❄️', 'Selon besoin en hiver');

  RAISE NOTICE 'Seed completed! Total: ~145 task templates created';
END $$;

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT
  'Seed completed!' as status,
  COUNT(*) as total_tasks
FROM task_templates;

SELECT
  c.name as category,
  c.emoji,
  COUNT(tt.id) as task_count
FROM categories c
LEFT JOIN task_templates tt ON c.id = tt.category_id
GROUP BY c.id, c.name, c.emoji
ORDER BY c.display_order;
