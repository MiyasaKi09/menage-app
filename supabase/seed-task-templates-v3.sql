-- ============================================
-- SEED TASK TEMPLATES V3 - RÉFÉRENTIEL PDF v2.0
-- ============================================
-- Total: 227 tâches réparties sur 14 catégories
-- Source: menage_app_taches_v2.pdf
--
-- Structure: name, duration_minutes, difficulty, base_points,
--            frequency, condition_code, needs_product, tip

DO $$
DECLARE
  -- Categories
  cat_cuisine UUID;
  cat_sdb UUID;
  cat_chambre UUID;
  cat_salon UUID;
  cat_entree UUID;
  cat_buanderie UUID;
  cat_exterieur UUID;
  cat_general UUID;
  cat_animaux UUID;
  cat_enfants UUID;
  cat_saisonnier UUID;
  cat_robots UUID;
  cat_bureau UUID;
  cat_colocation UUID;

  -- Frequencies
  freq_daily UUID;
  freq_2_3x_week UUID;
  freq_weekly UUID;
  freq_biweekly UUID;
  freq_monthly UUID;
  freq_quarterly UUID;
  freq_biannual UUID;
  freq_annual UUID;
  freq_seasonal UUID;
  freq_after_use UUID;
  freq_if_needed UUID;
BEGIN
  -- ========================================
  -- RÉCUPÉRER LES IDs DES CATÉGORIES
  -- ========================================
  SELECT id INTO cat_cuisine FROM categories WHERE name = 'Cuisine';
  SELECT id INTO cat_sdb FROM categories WHERE name = 'Salle de bain';
  SELECT id INTO cat_chambre FROM categories WHERE name = 'Chambre';
  SELECT id INTO cat_salon FROM categories WHERE name = 'Salon';
  SELECT id INTO cat_entree FROM categories WHERE name = 'Entrée';
  SELECT id INTO cat_buanderie FROM categories WHERE name = 'Buanderie';
  SELECT id INTO cat_exterieur FROM categories WHERE name = 'Extérieur';
  SELECT id INTO cat_general FROM categories WHERE name = 'Général';
  SELECT id INTO cat_animaux FROM categories WHERE name = 'Animaux';
  SELECT id INTO cat_enfants FROM categories WHERE name = 'Enfants';
  SELECT id INTO cat_saisonnier FROM categories WHERE name = 'Saisonnier';
  SELECT id INTO cat_robots FROM categories WHERE name = 'Robots';
  SELECT id INTO cat_bureau FROM categories WHERE name = 'Bureau';
  SELECT id INTO cat_colocation FROM categories WHERE name = 'Colocation';

  -- ========================================
  -- RÉCUPÉRER LES IDs DES FRÉQUENCES
  -- ========================================
  SELECT id INTO freq_daily FROM frequencies WHERE code = 'daily';
  SELECT id INTO freq_2_3x_week FROM frequencies WHERE code = '2-3x_week';
  SELECT id INTO freq_weekly FROM frequencies WHERE code = 'weekly';
  SELECT id INTO freq_biweekly FROM frequencies WHERE code = 'biweekly';
  SELECT id INTO freq_monthly FROM frequencies WHERE code = 'monthly';
  SELECT id INTO freq_quarterly FROM frequencies WHERE code = 'quarterly';
  SELECT id INTO freq_biannual FROM frequencies WHERE code = 'biannual';
  SELECT id INTO freq_annual FROM frequencies WHERE code = 'annual';
  SELECT id INTO freq_seasonal FROM frequencies WHERE code = 'seasonal';
  SELECT id INTO freq_after_use FROM frequencies WHERE code = 'after_use';
  SELECT id INTO freq_if_needed FROM frequencies WHERE code = 'if_needed';

  -- ========================================
  -- VÉRIFICATION
  -- ========================================
  IF cat_cuisine IS NULL THEN RAISE EXCEPTION 'Catégorie Cuisine non trouvée'; END IF;
  IF freq_daily IS NULL THEN RAISE EXCEPTION 'Fréquence daily non trouvée'; END IF;

  RAISE NOTICE 'Catégories et fréquences trouvées, début insertion...';

  -- ========================================
  -- SUPPRIMER LES ANCIENNES DONNÉES (CASCADE)
  -- ========================================
  -- ATTENTION: Supprime toutes les tâches planifiées et assignées !
  -- En production, faire un backup d'abord

  -- 1. Supprimer les tâches planifiées
  DELETE FROM scheduled_tasks WHERE TRUE;
  RAISE NOTICE '✓ scheduled_tasks vidé';

  -- 2. Supprimer les tâches assignées aux foyers
  DELETE FROM household_tasks WHERE TRUE;
  RAISE NOTICE '✓ household_tasks vidé';

  -- 3. Maintenant on peut supprimer les templates
  DELETE FROM task_templates WHERE TRUE;
  RAISE NOTICE '✓ task_templates vidé';

  -- ========================================
  -- ■ CUISINE (29 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Faire la vaisselle à la main', 15, 2, 30, cat_cuisine, freq_daily, 'pas_lave_vaisselle', TRUE, 'Rincer immédiatement après usage', '🍽️'),
    ('Lancer / vider le lave-vaisselle', 10, 1, 15, cat_cuisine, freq_daily, 'lave_vaisselle', FALSE, 'Racler les assiettes avant, pas besoin de rincer', '🫧'),
    ('Nettoyer les plaques de cuisson', 5, 2, 20, cat_cuisine, freq_after_use, NULL, TRUE, 'Nettoyer tiède, jamais brûlant ni froid', '🔥'),
    ('Essuyer le plan de travail', 2, 1, 5, cat_cuisine, freq_after_use, NULL, TRUE, 'Vinaigre blanc = désinfectant naturel', '✨'),
    ('Balayer le sol cuisine', 10, 2, 20, cat_cuisine, freq_daily, 'pas_robot_aspirateur', FALSE, 'Commencer par les coins vers la sortie', '🧹'),
    ('Passer la serpillière cuisine', 15, 2, 30, cat_cuisine, freq_2_3x_week, 'pas_robot_laveur', TRUE, 'Eau chaude + produit adapté au sol', '🧽'),
    ('Sortir les poubelles', 5, 1, 10, cat_cuisine, freq_2_3x_week, NULL, FALSE, 'Ne pas attendre que ça déborde', '🗑️'),
    ('Trier les déchets recyclables', 5, 1, 10, cat_cuisine, freq_2_3x_week, 'tri_selectif', FALSE, 'Rincer les contenants avant de trier', '♻️'),
    ('Nettoyer l''évier', 5, 2, 15, cat_cuisine, freq_daily, NULL, TRUE, 'Bicarbonate + vinaigre pour les odeurs', '🚰'),
    ('Nettoyer le micro-ondes', 5, 1, 15, cat_cuisine, freq_weekly, 'micro_ondes', TRUE, 'Bol d''eau + citron 3min = vapeur dégraissante', '📻'),
    ('Nettoyer le four', 30, 4, 80, cat_cuisine, freq_monthly, 'four', TRUE, 'Pâte bicarbonate + vinaigre, laisser agir une nuit', '🔲'),
    ('Nettoyer le réfrigérateur', 20, 3, 55, cat_cuisine, freq_monthly, NULL, TRUE, 'Vider complètement, eau vinaigrée', '🧊'),
    ('Dégivrer le congélateur', 30, 3, 70, cat_cuisine, freq_quarterly, 'congelateur', FALSE, 'Bassine d''eau chaude dedans accélère le processus', '❄️'),
    ('Nettoyer la hotte aspirante', 20, 3, 50, cat_cuisine, freq_monthly, 'hotte', TRUE, 'Filtres au lave-vaisselle si métalliques', '💨'),
    ('Nettoyer les placards intérieurs', 20, 2, 40, cat_cuisine, freq_quarterly, NULL, TRUE, 'Vérifier les dates de péremption en même temps', '🗄️'),
    ('Nettoyer le grille-pain', 5, 1, 10, cat_cuisine, freq_weekly, 'grille_pain', FALSE, 'Retourner et secouer les miettes', '🍞'),
    ('Détartrer la bouilloire', 10, 1, 20, cat_cuisine, freq_monthly, 'bouilloire', TRUE, 'Vinaigre blanc ou acide citrique', '🫖'),
    ('Détartrer la cafetière / machine à café', 15, 2, 30, cat_cuisine, freq_monthly, 'machine_cafe', TRUE, 'Suivre les instructions du fabricant', '☕'),
    ('Nettoyer le robot de cuisine / blender', 10, 2, 20, cat_cuisine, freq_after_use, 'robot_cuisine', TRUE, 'Eau chaude + liquide vaisselle, mixer 30sec', '🥣'),
    ('Nettoyer le robot cuiseur (Thermomix…)', 10, 2, 20, cat_cuisine, freq_after_use, 'robot_cuiseur', TRUE, 'Cycle auto-nettoyage si dispo, sinon eau + liquide', '🤖'),
    ('Nettoyer les joints du frigo', 10, 2, 25, cat_cuisine, freq_quarterly, NULL, TRUE, 'Brosse à dents + bicarbonate', '🧼'),
    ('Dégraisser les murs autour de la cuisinière', 15, 3, 40, cat_cuisine, freq_monthly, NULL, TRUE, 'Bicarbonate en pâte sur les projections', '🧱'),
    ('Nettoyer derrière / sous le frigo', 15, 3, 45, cat_cuisine, freq_biannual, NULL, FALSE, 'Aspirer les poussières de la grille arrière', '🔌'),
    ('Nettoyer la poubelle (bac)', 10, 2, 25, cat_cuisine, freq_monthly, NULL, TRUE, 'Désinfecter + bicarbonate contre les odeurs', '🗑️'),
    ('Ranger le garde-manger / cellier', 20, 2, 35, cat_cuisine, freq_quarterly, 'garde_manger', FALSE, 'FIFO : premier entré, premier sorti', '📦'),
    ('Nettoyer le lave-vaisselle', 15, 2, 30, cat_cuisine, freq_monthly, 'lave_vaisselle', TRUE, 'Cycle vide avec vinaigre + bicarbonate', '🫧'),
    ('Nettoyer la plancha / barbecue', 20, 3, 45, cat_cuisine, freq_after_use, 'plancha_bbq', TRUE, 'Nettoyer encore chaud avec une brosse', '🍖'),
    ('Laver les torchons de cuisine', 5, 1, 10, cat_cuisine, freq_2_3x_week, NULL, FALSE, '60°C minimum pour tuer les bactéries', '🧺'),
    ('Vider et nettoyer le bac à compost', 5, 2, 15, cat_cuisine, freq_2_3x_week, 'compost', FALSE, 'Rincer au vinaigre contre les odeurs', '🌱');

  RAISE NOTICE '✓ Cuisine: 29 tâches insérées';

  -- ========================================
  -- ■ SALLE DE BAIN (20 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Nettoyer le lavabo', 5, 1, 15, cat_sdb, freq_weekly, NULL, TRUE, 'Nettoyage profond 1x/semaine', '🚰'),
    ('Nettoyer les toilettes', 10, 2, 30, cat_sdb, freq_2_3x_week, NULL, TRUE, 'Intérieur, extérieur, dessous de la lunette', '🚽'),
    ('Nettoyer la douche / baignoire', 15, 3, 40, cat_sdb, freq_weekly, NULL, TRUE, 'Rincer les parois après chaque douche', '🚿'),
    ('Nettoyer le miroir SDB', 5, 1, 10, cat_sdb, freq_weekly, NULL, TRUE, 'Vinaigre + papier journal = zéro traces', '🪞'),
    ('Passer la serpillière SDB', 10, 2, 25, cat_sdb, freq_weekly, 'pas_robot_laveur', TRUE, 'Sécher après pour éviter moisissures', '🧽'),
    ('Changer les serviettes', 5, 1, 10, cat_sdb, freq_2_3x_week, NULL, FALSE, 'Toutes les 3 utilisations max', '🛁'),
    ('Nettoyer la paroi de douche', 10, 2, 30, cat_sdb, freq_weekly, 'paroi_douche', TRUE, 'Raclette après chaque douche pour moins de calcaire', '🚿'),
    ('Détartrer les robinets', 10, 2, 25, cat_sdb, freq_monthly, 'eau_dure', TRUE, 'Trempage dans vinaigre dilué', '🚰'),
    ('Détartrer le pommeau de douche', 15, 2, 35, cat_sdb, freq_monthly, 'eau_dure', TRUE, 'Sac plastique + vinaigre autour, laisser une nuit', '🚿'),
    ('Nettoyer les joints de carrelage', 20, 3, 50, cat_sdb, freq_quarterly, NULL, TRUE, 'Brosse à dents + bicarbonate + eau oxygénée', '🧱'),
    ('Laver le rideau de douche', 10, 2, 25, cat_sdb, freq_monthly, 'rideau_douche', FALSE, 'Machine à 30°C avec des serviettes', '🚿'),
    ('Nettoyer / ranger les tiroirs SDB', 15, 2, 30, cat_sdb, freq_quarterly, NULL, FALSE, 'Jeter les produits périmés', '🗄️'),
    ('Nettoyer l''aération / VMC salle de bain', 10, 2, 30, cat_sdb, freq_quarterly, NULL, TRUE, 'Aspirer la grille, améliore l''efficacité', '💨'),
    ('Nettoyer derrière les toilettes', 15, 3, 45, cat_sdb, freq_monthly, NULL, TRUE, 'Zone souvent oubliée mais importante', '🚽'),
    ('Déboucher les canalisations (préventif)', 10, 2, 25, cat_sdb, freq_monthly, NULL, TRUE, 'Bicarbonate + vinaigre + eau bouillante', '🔧'),
    ('Nettoyer la brosse WC et son support', 5, 2, 20, cat_sdb, freq_weekly, NULL, TRUE, 'Javel dans le support, laisser agir', '🧹'),
    ('Laver les tapis de bain', 5, 1, 10, cat_sdb, freq_weekly, 'tapis_bain', FALSE, 'Machine 60°C, bien sécher', '🛁'),
    ('Nettoyer le bidet', 10, 2, 25, cat_sdb, freq_weekly, 'bidet', TRUE, 'Même produit que les toilettes', '🚿'),
    ('Vider la poubelle SDB', 5, 1, 10, cat_sdb, freq_weekly, NULL, FALSE, 'Petit sac poubelle = changement plus facile', '🗑️'),
    ('Nettoyer le meuble sous vasque', 10, 2, 20, cat_sdb, freq_quarterly, NULL, TRUE, 'Vérifier s''il n''y a pas de fuite en même temps', '🗄️');

  RAISE NOTICE '✓ Salle de bain: 20 tâches insérées';

  -- ========================================
  -- ■■ CHAMBRE (16 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Faire le lit', 5, 1, 10, cat_chambre, freq_daily, NULL, FALSE, 'Aérer 10min avant de faire le lit', '🛏️'),
    ('Rangement rapide chambre', 5, 1, 10, cat_chambre, freq_daily, NULL, FALSE, 'Vêtements, objets : 5min le soir évite l''accumulation', '👕'),
    ('Changer les draps', 15, 2, 40, cat_chambre, freq_weekly, NULL, FALSE, '1 semaine idéal, 2 semaines max', '🛏️'),
    ('Aspirer la chambre', 15, 2, 35, cat_chambre, freq_weekly, 'pas_robot_aspirateur', FALSE, 'Sous le lit aussi, nid à poussière', '🧹'),
    ('Dépoussiérer les meubles de chambre', 10, 1, 20, cat_chambre, freq_weekly, NULL, TRUE, 'Chiffon microfibre légèrement humide', '✨'),
    ('Retourner le matelas', 15, 3, 50, cat_chambre, freq_quarterly, NULL, FALSE, 'Tête-pied ET dessus-dessous en alternance', '🔄'),
    ('Aspirer le matelas', 15, 2, 35, cat_chambre, freq_quarterly, NULL, FALSE, 'Bicarbonate 30min avant puis aspirer', '🧹'),
    ('Laver les oreillers', 10, 2, 30, cat_chambre, freq_quarterly, NULL, FALSE, 'Machine à 60°C, bien sécher', '🧺'),
    ('Laver la couette', 10, 2, 35, cat_chambre, freq_biannual, NULL, FALSE, 'Pressing si trop grande pour la machine', '🧺'),
    ('Trier / ranger l''armoire', 30, 2, 50, cat_chambre, freq_biannual, NULL, FALSE, 'Pas porté en 1 an = don', '👚'),
    ('Nettoyer sous le lit', 15, 3, 45, cat_chambre, freq_monthly, NULL, FALSE, 'Embout plat de l''aspirateur', '🧹'),
    ('Nettoyer les vitres de la chambre', 15, 2, 35, cat_chambre, freq_monthly, 'pas_robot_vitres', TRUE, 'Jour nuageux = moins de traces', '🪟'),
    ('Laver les protège-matelas / alèses', 10, 2, 25, cat_chambre, freq_monthly, NULL, FALSE, '60°C pour éliminer les acariens', '🧺'),
    ('Nettoyer le dressing / penderie', 30, 3, 55, cat_chambre, freq_biannual, 'dressing', TRUE, 'Aspirer le fond, antimites si besoin', '👔'),
    ('Dépoussiérer les luminaires chambre', 10, 2, 25, cat_chambre, freq_monthly, NULL, TRUE, 'Éteindre et laisser refroidir avant', '💡'),
    ('Nettoyer les cadres / déco murale', 10, 1, 20, cat_chambre, freq_quarterly, NULL, TRUE, 'Plumeau ou chiffon microfibre', '🖼️');

  RAISE NOTICE '✓ Chambre: 16 tâches insérées';

  -- ========================================
  -- ■■ SALON (20 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Rangement rapide salon', 10, 1, 15, cat_salon, freq_daily, NULL, FALSE, 'Tout a une place attitrée', '🛋️'),
    ('Aspirer le salon', 15, 2, 35, cat_salon, freq_weekly, 'pas_robot_aspirateur', FALSE, 'Déplacer les meubles légers régulièrement', '🧹'),
    ('Passer la serpillière salon', 15, 2, 30, cat_salon, freq_weekly, 'sol_dur_salon', TRUE, 'Adapté au revêtement (parquet, carrelage…)', '🧽'),
    ('Dépoussiérer les meubles du salon', 10, 1, 20, cat_salon, freq_weekly, NULL, TRUE, 'Haut vers bas, gauche à droite', '✨'),
    ('Dépoussiérer la TV / écrans', 5, 1, 15, cat_salon, freq_weekly, NULL, TRUE, 'Chiffon microfibre sec uniquement', '📺'),
    ('Aspirer le canapé', 15, 2, 35, cat_salon, freq_monthly, NULL, FALSE, 'Retirer les coussins, aspirer les recoins', '🛋️'),
    ('Nettoyer les télécommandes / manettes', 5, 1, 10, cat_salon, freq_weekly, NULL, TRUE, 'Lingette ou coton-tige alcoolisé', '🎮'),
    ('Laver les housses de canapé', 20, 2, 45, cat_salon, freq_quarterly, 'housses_canape', FALSE, 'Vérifier l''étiquette d''entretien', '🧺'),
    ('Nettoyer les vitres intérieures salon', 20, 2, 45, cat_salon, freq_monthly, 'pas_robot_vitres', TRUE, 'Jour nuageux = moins de traces', '🪟'),
    ('Dépoussiérer les luminaires salon', 15, 2, 35, cat_salon, freq_monthly, NULL, TRUE, 'Éteindre et laisser refroidir avant', '💡'),
    ('Nettoyer les plantes (feuilles)', 15, 1, 25, cat_salon, freq_monthly, 'plantes', FALSE, 'Douche tiède ou chiffon humide', '🌿'),
    ('Aspirer / nettoyer les tapis', 20, 3, 55, cat_salon, freq_monthly, 'tapis', TRUE, 'Bicarbonate 30min avant aspiration', '🧹'),
    ('Dépoussiérer étagères / bibliothèque', 20, 2, 40, cat_salon, freq_monthly, NULL, TRUE, 'Retirer les objets, pas juste contourner', '📚'),
    ('Nettoyer derrière la TV / meubles', 15, 3, 45, cat_salon, freq_quarterly, NULL, FALSE, 'Aspirateur + lingette pour les câbles', '🔌'),
    ('Nettoyer les rideaux / stores salon', 30, 3, 70, cat_salon, freq_quarterly, 'rideaux_ou_stores', FALSE, 'Aspirer ou machine selon matière', '🪟'),
    ('Nettoyer la cheminée / insert', 30, 4, 80, cat_salon, freq_monthly, 'cheminee', TRUE, 'Cendres froides uniquement, aspirer', '🔥'),
    ('Cirer / nourrir les meubles en bois', 20, 2, 40, cat_salon, freq_quarterly, 'meubles_bois', TRUE, 'Dans le sens des fibres du bois', '🪵'),
    ('Nettoyer le canapé en cuir', 15, 2, 35, cat_salon, freq_monthly, 'canape_cuir', TRUE, 'Lait démaquillant ou savon de Marseille', '🛋️'),
    ('Nettoyer le climatiseur / ventilateur', 15, 2, 30, cat_salon, freq_seasonal, 'clim_ventilo', TRUE, 'Filtres + pales, avant la saison', '❄️'),
    ('Dépoussiérer les objets déco / cadres', 10, 1, 15, cat_salon, freq_monthly, NULL, TRUE, 'Attention aux objets fragiles', '🖼️');

  RAISE NOTICE '✓ Salon: 20 tâches insérées';

  -- ========================================
  -- ■ ENTRÉE (8 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Ranger l''entrée', 5, 1, 10, cat_entree, freq_daily, NULL, FALSE, 'Crochets et bacs = rangement facile', '🚪'),
    ('Balayer / aspirer l''entrée', 5, 1, 15, cat_entree, freq_2_3x_week, 'pas_robot_aspirateur', FALSE, 'Zone à fort passage = plus souvent', '🧹'),
    ('Passer la serpillière entrée', 10, 2, 25, cat_entree, freq_weekly, 'pas_robot_laveur', TRUE, 'Attention aux traces de chaussures', '🧽'),
    ('Nettoyer le paillasson', 10, 2, 25, cat_entree, freq_weekly, NULL, FALSE, 'Secouer dehors + aspirer', '🚪'),
    ('Nettoyer la porte d''entrée', 10, 2, 25, cat_entree, freq_monthly, NULL, TRUE, 'Intérieur ET extérieur', '🚪'),
    ('Ranger le placard à chaussures', 15, 1, 20, cat_entree, freq_monthly, 'placard_chaussures', FALSE, 'Tri saisonnier', '👟'),
    ('Nettoyer le miroir d''entrée', 5, 1, 10, cat_entree, freq_weekly, 'miroir_entree', TRUE, 'Vinaigre + microfibre', '🪞'),
    ('Nettoyer la boîte aux lettres', 5, 1, 10, cat_entree, freq_quarterly, 'boite_lettres', TRUE, 'Extérieur + intérieur', '📬');

  RAISE NOTICE '✓ Entrée: 8 tâches insérées';

  -- ========================================
  -- ■ BUANDERIE (15 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Lancer une machine de linge', 10, 1, 15, cat_buanderie, freq_2_3x_week, NULL, TRUE, 'Trier par couleur ET par température', '🧺'),
    ('Étendre le linge', 15, 2, 25, cat_buanderie, freq_2_3x_week, 'pas_seche_linge', FALSE, 'Secouer chaque pièce avant d''étendre', '👕'),
    ('Plier et ranger le linge', 20, 1, 25, cat_buanderie, freq_2_3x_week, NULL, FALSE, 'Devant une série ça passe tout seul', '👚'),
    ('Repasser', 30, 3, 60, cat_buanderie, freq_weekly, 'repassage', FALSE, 'Du plus fragile au plus résistant', '👔'),
    ('Vider le sèche-linge', 5, 1, 10, cat_buanderie, freq_2_3x_week, 'seche_linge', FALSE, 'Plier tout de suite = pas de faux plis', '🌀'),
    ('Nettoyer le filtre du sèche-linge', 5, 1, 10, cat_buanderie, freq_after_use, 'seche_linge', FALSE, 'Après chaque cycle, indispensable', '🌀'),
    ('Nettoyer la machine à laver', 15, 2, 30, cat_buanderie, freq_monthly, NULL, TRUE, 'Cycle vide 90°C + vinaigre, nettoyer le joint', '🧺'),
    ('Détacher le linge (pré-traitement)', 10, 2, 25, cat_buanderie, freq_if_needed, NULL, TRUE, 'Traiter avant lavage, jamais sèche-linge sur une tache', '🧴'),
    ('Coudre / réparer un vêtement', 20, 3, 45, cat_buanderie, freq_if_needed, NULL, FALSE, 'Bouton, ourlet, accroc : réparation = économie', '🧵'),
    ('Nettoyer le bac à lessive', 5, 1, 10, cat_buanderie, freq_monthly, NULL, TRUE, 'Sortir le bac, frotter sous l''eau chaude', '🧴'),
    ('Nettoyer la table / planche à repasser', 10, 1, 15, cat_buanderie, freq_quarterly, 'repassage', TRUE, 'Housse en machine si amovible', '👔'),
    ('Trier les vêtements à donner / jeter', 30, 2, 45, cat_buanderie, freq_biannual, NULL, FALSE, 'Pas porté depuis 1 an = don', '👕'),
    ('Nettoyer l''étendoir / séchoir', 10, 1, 15, cat_buanderie, freq_quarterly, 'pas_seche_linge', TRUE, 'Poussière + traces de calcaire', '🧺'),
    ('Laver les sacs / cabas réutilisables', 10, 1, 15, cat_buanderie, freq_monthly, NULL, FALSE, 'Machine ou à la main selon matière', '🛍️'),
    ('Imperméabiliser les vêtements outdoor', 15, 2, 30, cat_buanderie, freq_seasonal, 'vetements_outdoor', TRUE, 'Spray après lavage, avant la saison', '🧥');

  RAISE NOTICE '✓ Buanderie: 15 tâches insérées';

  -- ========================================
  -- ■ GÉNÉRAL (16 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Aérer les pièces', 5, 1, 5, cat_general, freq_daily, NULL, FALSE, '10min suffisent, même en hiver', '🪟'),
    ('Vider les petites poubelles (toutes pièces)', 10, 1, 15, cat_general, freq_weekly, NULL, FALSE, 'Faire le tour de toutes les pièces', '🗑️'),
    ('Dépoussiérer les radiateurs', 15, 2, 35, cat_general, freq_monthly, 'radiateurs', TRUE, 'Aspirateur embout fin ou brosse spéciale', '🔥'),
    ('Nettoyer les interrupteurs / poignées / prises', 10, 1, 20, cat_general, freq_monthly, NULL, TRUE, 'Lingette désinfectante, chiffon sec pour les prises', '🔌'),
    ('Changer les filtres VMC / clim', 15, 2, 35, cat_general, freq_quarterly, 'vmc_clim', FALSE, 'Améliore la qualité de l''air', '💨'),
    ('Vérifier les détecteurs de fumée', 5, 1, 15, cat_general, freq_monthly, 'detecteur_fumee', FALSE, 'Appuyer sur le bouton test', '🔔'),
    ('Nettoyer les grilles d''aération', 15, 2, 35, cat_general, freq_quarterly, NULL, TRUE, 'Aspirer puis laver si possible', '💨'),
    ('Laver les rideaux / voilages', 30, 3, 60, cat_general, freq_biannual, 'rideaux', FALSE, 'Programme délicat, repasser humide', '🪟'),
    ('Nettoyer les stores vénitiens', 30, 3, 60, cat_general, freq_quarterly, 'stores', TRUE, 'Chaussette sur main entre les lamelles', '🪟'),
    ('Nettoyer l''aspirateur / vider le bac', 15, 2, 30, cat_general, freq_monthly, 'aspirateur_classique', FALSE, 'Vider, nettoyer filtres, vérifier brosse', '🧹'),
    ('Trier le courrier / papiers / archiver', 15, 1, 20, cat_general, freq_weekly, NULL, FALSE, 'Système: action, à classer, poubelle', '📄'),
    ('Faire les courses ménage', 30, 2, 40, cat_general, freq_monthly, NULL, FALSE, 'Liste permanente sur le frigo / appli', '🛒'),
    ('Ranger / trier un placard', 30, 2, 50, cat_general, freq_quarterly, NULL, FALSE, 'Un placard à la fois', '🗄️'),
    ('Nettoyer les plinthes', 20, 2, 35, cat_general, freq_quarterly, NULL, TRUE, 'Chiffon humide ou chaussette sur la main', '🧹'),
    ('Nettoyer les traces sur les murs', 15, 2, 30, cat_general, freq_monthly, NULL, TRUE, 'Éponge magique ou bicarbonate', '🧱'),
    ('Aspirer / nettoyer les escaliers', 20, 3, 45, cat_general, freq_weekly, 'escaliers', FALSE, 'Du haut vers le bas', '🪜');

  RAISE NOTICE '✓ Général: 16 tâches insérées';

  -- ========================================
  -- ■ ROBOTS (12 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Lancer le robot aspirateur', 2, 1, 10, cat_robots, freq_2_3x_week, 'robot_aspirateur', FALSE, 'Dégager le sol avant de lancer', '🤖'),
    ('Vider le bac du robot aspirateur', 5, 1, 10, cat_robots, freq_2_3x_week, 'robot_aspirateur', FALSE, 'Après chaque passage idéalement', '🗑️'),
    ('Nettoyer les brosses du robot aspirateur', 10, 2, 25, cat_robots, freq_monthly, 'robot_aspirateur', FALSE, 'Retirer cheveux et fibres enroulés', '🧹'),
    ('Nettoyer les capteurs du robot aspirateur', 5, 1, 15, cat_robots, freq_monthly, 'robot_aspirateur', TRUE, 'Chiffon doux sec, améliore la navigation', '👁️'),
    ('Lancer le robot laveur', 2, 1, 10, cat_robots, freq_2_3x_week, 'robot_laveur', FALSE, 'Aspirer avant pour un meilleur résultat', '🤖'),
    ('Nettoyer le réservoir / les serpillières du robot laveur', 5, 1, 15, cat_robots, freq_after_use, 'robot_laveur', FALSE, 'Rincer les pads, vider le bac sale', '🧽'),
    ('Vider la station d''auto-vidage', 5, 1, 10, cat_robots, freq_weekly, 'robot_station_autovidage', FALSE, 'Changer le sac si station avec sac', '🗑️'),
    ('Nettoyer la base de charge du robot', 10, 1, 15, cat_robots, freq_monthly, 'robot_aspirateur', TRUE, 'Contacts de charge + bac de récupération', '🔌'),
    ('Lancer le robot lave-vitre', 5, 1, 15, cat_robots, freq_monthly, 'robot_vitres', FALSE, 'Vaporiser le produit sur la vitre avant', '🪟'),
    ('Nettoyer les pads du robot lave-vitre', 5, 1, 10, cat_robots, freq_after_use, 'robot_vitres', FALSE, 'Machine ou rinçage à la main', '🧽'),
    ('Changer le filtre du purificateur d''air', 10, 2, 25, cat_robots, freq_quarterly, 'purificateur_air', FALSE, 'Suivre l''indicateur de l''appareil', '💨'),
    ('Nettoyer le robot tondeuse', 15, 2, 30, cat_robots, freq_weekly, 'robot_tondeuse', FALSE, 'Dessous + lames, vérifier le fil périmétrique', '🌿');

  RAISE NOTICE '✓ Robots: 12 tâches insérées';

  -- ========================================
  -- ■ EXTÉRIEUR (24 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Balayer le balcon / terrasse', 10, 1, 20, cat_exterieur, freq_weekly, 'balcon_terrasse', FALSE, 'Coins et recoins aussi', '🧹'),
    ('Arroser les plantes d''extérieur', 10, 1, 15, cat_exterieur, freq_2_3x_week, 'plantes_exterieur', FALSE, 'Tôt le matin ou en soirée', '💧'),
    ('Nettoyer le mobilier de jardin', 20, 2, 35, cat_exterieur, freq_monthly, 'mobilier_jardin', TRUE, 'Produit adapté : bois, plastique, métal', '🪑'),
    ('Tondre la pelouse', 45, 3, 80, cat_exterieur, freq_weekly, 'pelouse', FALSE, 'Pas trop court, laisser 5-7cm', '🌿'),
    ('Désherber', 30, 3, 55, cat_exterieur, freq_2_3x_week, 'jardin', FALSE, 'Après la pluie c''est plus facile', '🌱'),
    ('Tailler les haies', 60, 4, 100, cat_exterieur, freq_monthly, 'haies', FALSE, 'Juin et septembre sont les meilleurs moments', '✂️'),
    ('Ramasser les feuilles mortes', 30, 2, 45, cat_exterieur, freq_weekly, 'jardin_automne', FALSE, 'Excellent compost', '🍂'),
    ('Nettoyer les gouttières', 30, 4, 80, cat_exterieur, freq_biannual, 'gouttiere', FALSE, 'Automne surtout, gants obligatoires', '🏠'),
    ('Nettoyer le barbecue', 20, 3, 45, cat_exterieur, freq_after_use, 'barbecue', TRUE, 'Grilles encore chaudes = plus facile', '🍖'),
    ('Nettoyer la piscine', 30, 3, 60, cat_exterieur, freq_weekly, 'piscine', TRUE, 'pH, chlore, nettoyage du filtre', '🏊'),
    ('Entretenir le jacuzzi / spa', 20, 3, 50, cat_exterieur, freq_weekly, 'jacuzzi', TRUE, 'Traitement de l''eau + nettoyage filtre', '🛁'),
    ('Laver la voiture', 30, 2, 45, cat_exterieur, freq_monthly, 'voiture', TRUE, 'Ombre, jamais en plein soleil', '🚗'),
    ('Nettoyer le garage', 45, 3, 70, cat_exterieur, freq_quarterly, 'garage', FALSE, 'Balayer + ranger + désencombrer', '🏠'),
    ('Nettoyer la terrasse au karcher', 45, 3, 75, cat_exterieur, freq_biannual, 'terrasse_karcher', FALSE, 'Garder la distance pour ne pas abîmer', '💦'),
    ('Planter / rempoter', 30, 2, 45, cat_exterieur, freq_seasonal, 'jardin', FALSE, 'Terreau frais et pot adapté', '🌱'),
    ('Arroser le jardin / potager', 20, 1, 20, cat_exterieur, freq_daily, 'potager', FALSE, 'Goutte-à-goutte ou arrosage au pied', '💧'),
    ('Entretenir le potager', 30, 3, 55, cat_exterieur, freq_2_3x_week, 'potager', FALSE, 'Pailler pour limiter l''arrosage', '🥕'),
    ('Nettoyer l''abri de jardin / cabanon', 30, 3, 50, cat_exterieur, freq_biannual, 'abri_jardin', FALSE, 'Ranger outils, vérifier humidité', '🏠'),
    ('Ranger les jouets d''extérieur', 10, 1, 15, cat_exterieur, freq_daily, 'enfants_exterieur', FALSE, 'Bac dédié accessible aux enfants', '🎾'),
    ('Nettoyer les volets / persiennes', 30, 3, 55, cat_exterieur, freq_biannual, 'volets', TRUE, 'Éponge + eau savonneuse', '🪟'),
    ('Nettoyer les luminaires extérieurs', 15, 2, 30, cat_exterieur, freq_quarterly, 'luminaires_ext', TRUE, 'Insectes accumulés, éteindre avant', '💡'),
    ('Déneiger l''allée / le trottoir', 20, 4, 60, cat_exterieur, freq_if_needed, 'zone_neige', FALSE, 'Sel avant si gel annoncé', '❄️'),
    ('Nettoyer les vitres extérieures', 30, 3, 65, cat_exterieur, freq_quarterly, 'rdc_ou_maison', TRUE, 'Raclette pro = résultat pro', '🪟'),
    ('Entretenir le composteur', 10, 2, 20, cat_exterieur, freq_weekly, 'composteur', FALSE, 'Mélanger et équilibrer vert/brun', '🌱');

  RAISE NOTICE '✓ Extérieur: 24 tâches insérées';

  -- ========================================
  -- ■ ANIMAUX (15 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Nettoyer la litière', 5, 2, 20, cat_animaux, freq_daily, 'chat', TRUE, '1x/jour minimum', '🐱'),
    ('Changer la litière complète', 15, 3, 40, cat_animaux, freq_weekly, 'chat', TRUE, 'Laver le bac au vinaigre', '🐱'),
    ('Nettoyer les gamelles', 5, 1, 10, cat_animaux, freq_daily, 'animaux', TRUE, 'Eau chaude + produit vaisselle', '🍽️'),
    ('Aspirer les poils d''animaux', 15, 2, 30, cat_animaux, freq_2_3x_week, 'animaux_poils', FALSE, 'Gant en caoutchouc sur le canapé', '🧹'),
    ('Laver le panier / coussin de l''animal', 15, 2, 30, cat_animaux, freq_monthly, 'animaux', FALSE, 'Machine 60°C si possible', '🧺'),
    ('Nettoyer l''aquarium', 30, 3, 60, cat_animaux, freq_weekly, 'aquarium', TRUE, '25% d''eau max, ne pas tout changer', '🐠'),
    ('Nettoyer la cage (rongeur / oiseau)', 20, 2, 40, cat_animaux, freq_2_3x_week, 'rongeur_oiseau', TRUE, 'Vinaigre, pas de javel', '🐹'),
    ('Brosser / toiletter l''animal', 15, 2, 25, cat_animaux, freq_2_3x_week, 'animaux_poils', FALSE, 'Vérifier parasites en même temps', '🐕'),
    ('Laver le chien', 30, 3, 50, cat_animaux, freq_monthly, 'chien', TRUE, 'Shampoing spécial chien uniquement', '🐕'),
    ('Promener le chien', 30, 2, 35, cat_animaux, freq_daily, 'chien', FALSE, 'Varier les parcours', '🦮'),
    ('Nettoyer les traces de pattes', 5, 1, 10, cat_animaux, freq_daily, 'chien', TRUE, 'Serpillière rapide à l''entrée', '🐾'),
    ('Nettoyer le terrarium', 20, 3, 45, cat_animaux, freq_weekly, 'reptile', TRUE, 'Substrat + décor + vitres', '🦎'),
    ('Nettoyer le filtre de l''aquarium', 10, 2, 25, cat_animaux, freq_monthly, 'aquarium', FALSE, 'Rincer dans l''eau de l''aquarium, jamais l''eau du robinet', '🐠'),
    ('Désinfecter les jouets de l''animal', 10, 1, 15, cat_animaux, freq_monthly, 'animaux', TRUE, 'Vinaigre blanc ou lave-vaisselle', '🎾'),
    ('Traitement anti-puces / anti-parasites', 5, 2, 20, cat_animaux, freq_monthly, 'animaux', TRUE, 'Traiter l''animal ET l''environnement', '💊');

  RAISE NOTICE '✓ Animaux: 15 tâches insérées';

  -- ========================================
  -- ■ ENFANTS (18 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Ranger les jouets', 15, 1, 20, cat_enfants, freq_daily, 'enfants', FALSE, 'Impliquer les enfants dès 3 ans', '🧸'),
    ('Nettoyer la table à langer', 5, 1, 15, cat_enfants, freq_after_use, 'bebe', TRUE, 'Lingette après chaque change', '👶'),
    ('Stériliser les biberons / tétines', 10, 2, 25, cat_enfants, freq_daily, 'bebe', TRUE, 'Stérilisateur ou casserole d''eau bouillante', '🍼'),
    ('Laver les jouets', 20, 2, 35, cat_enfants, freq_monthly, 'enfants', TRUE, 'Vinaigre pour le plastique, machine pour les peluches', '🧸'),
    ('Nettoyer la chaise haute', 5, 1, 15, cat_enfants, freq_after_use, 'bebe', TRUE, 'Démonter les parties amovibles', '🪑'),
    ('Nettoyer la poussette', 20, 2, 35, cat_enfants, freq_monthly, 'bebe', TRUE, 'Housse en machine si amovible', '🛒'),
    ('Trier les vêtements enfants (taille)', 30, 2, 40, cat_enfants, freq_quarterly, 'enfants', FALSE, 'Les enfants grandissent vite !', '👕'),
    ('Nettoyer le parc / tapis d''éveil', 15, 2, 30, cat_enfants, freq_weekly, 'bebe', TRUE, 'Surface + dessous', '🎨'),
    ('Ranger / trier la chambre d''enfant', 20, 2, 35, cat_enfants, freq_weekly, 'enfants', FALSE, 'Avec l''enfant si possible', '🏠'),
    ('Laver les doudous / peluches', 15, 2, 30, cat_enfants, freq_monthly, 'enfants', FALSE, '30°C en machine, sac à linge', '🧸'),
    ('Nettoyer le lit bébé / barrières', 15, 2, 30, cat_enfants, freq_monthly, 'bebe', TRUE, 'Vinaigre blanc, pas de produit chimique', '🛏️'),
    ('Nettoyer les crayons / peinture sur les murs', 10, 2, 25, cat_enfants, freq_if_needed, 'enfants', TRUE, 'Éponge magique ou dentifrice blanc', '🎨'),
    ('Préparer le sac d''école / crèche', 10, 1, 15, cat_enfants, freq_daily, 'enfants_ecole', FALSE, 'Checklist affichée = routine facile', '🎒'),
    ('Nettoyer le siège auto', 20, 2, 35, cat_enfants, freq_monthly, 'enfants_voiture', TRUE, 'Aspirateur + lingette, housse en machine', '🚗'),
    ('Vérifier les dates de péremption alimentation bébé', 10, 1, 15, cat_enfants, freq_weekly, 'bebe', FALSE, 'Petits pots, lait, céréales…', '🍼'),
    ('Nettoyer le pot / réducteur WC', 5, 2, 20, cat_enfants, freq_after_use, 'enfants_petit', TRUE, 'Désinfecter après chaque usage', '🚽'),
    ('Organiser les activités / fournitures', 15, 1, 20, cat_enfants, freq_monthly, 'enfants', FALSE, 'Bacs étiquetés par type d''activité', '🎨'),
    ('Désinfecter les surfaces à hauteur d''enfant', 15, 2, 40, cat_enfants, freq_weekly, 'enfants', TRUE, 'Tables basses, poignées basses', '✨');

  RAISE NOTICE '✓ Enfants: 18 tâches insérées';

  -- ========================================
  -- ■ BUREAU (10 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Rangement rapide bureau', 5, 1, 10, cat_bureau, freq_daily, 'bureau', FALSE, 'Surface dégagée = esprit clair', '💼'),
    ('Dépoussiérer le bureau et étagères', 10, 1, 20, cat_bureau, freq_weekly, 'bureau', TRUE, 'Chiffon microfibre', '✨'),
    ('Nettoyer l''écran d''ordinateur', 5, 1, 10, cat_bureau, freq_weekly, 'bureau', TRUE, 'Chiffon microfibre sec, pas de produit', '🖥️'),
    ('Nettoyer le clavier / souris', 10, 2, 25, cat_bureau, freq_weekly, 'bureau', TRUE, 'Air comprimé + coton-tige alcoolisé', '⌨️'),
    ('Organiser les câbles', 15, 2, 30, cat_bureau, freq_quarterly, 'bureau', FALSE, 'Serre-câbles et gaines', '🔌'),
    ('Aspirer le sol du bureau', 10, 2, 20, cat_bureau, freq_weekly, 'bureau', FALSE, 'Sous le bureau aussi', '🧹'),
    ('Nettoyer l''imprimante', 10, 2, 20, cat_bureau, freq_quarterly, 'imprimante', TRUE, 'Dépoussiérer + nettoyer le bac', '🖨️'),
    ('Vider la corbeille à papier', 5, 1, 5, cat_bureau, freq_weekly, 'bureau', FALSE, 'Trier le recyclable', '🗑️'),
    ('Nettoyer le téléphone / casque', 5, 1, 10, cat_bureau, freq_weekly, 'bureau', TRUE, 'Lingette désinfectante', '📞'),
    ('Ranger les fournitures', 10, 1, 15, cat_bureau, freq_monthly, 'bureau', FALSE, 'Tiroirs organisés avec séparateurs', '📝');

  RAISE NOTICE '✓ Bureau: 10 tâches insérées';

  -- ========================================
  -- ■ SAISONNIER (14 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Grand ménage de printemps', 240, 5, 300, cat_saisonnier, freq_annual, NULL, TRUE, 'Planifier sur plusieurs jours', '🌸'),
    ('Ranger les vêtements de saison', 45, 2, 60, cat_saisonnier, freq_biannual, NULL, FALSE, 'Laver avant de ranger, housses anti-mites', '👕'),
    ('Purger / nettoyer les radiateurs (avant hiver)', 30, 3, 70, cat_saisonnier, freq_annual, 'chauffage_radiateur', TRUE, 'Purger si nécessaire', '🔥'),
    ('Vérifier les joints de fenêtres', 20, 2, 40, cat_saisonnier, freq_annual, NULL, FALSE, 'Avant l''hiver, économies d''énergie', '🪟'),
    ('Nettoyer le climatiseur (fin de saison)', 30, 3, 60, cat_saisonnier, freq_annual, 'climatiseur', TRUE, 'Filtres + grilles, avant l''été', '❄️'),
    ('Préparer le jardin (printemps)', 120, 4, 150, cat_saisonnier, freq_annual, 'jardin', FALSE, 'Tailler, planter, pailler', '🌱'),
    ('Hiverner le jardin', 90, 3, 120, cat_saisonnier, freq_annual, 'jardin', FALSE, 'Protéger les plantes fragiles', '🍂'),
    ('Hiverner la piscine', 60, 3, 90, cat_saisonnier, freq_annual, 'piscine', TRUE, 'Bâche + produit d''hivernage', '🏊'),
    ('Réviser la chaudière / chauffage', 30, 3, 50, cat_saisonnier, freq_annual, 'chaudiere', FALSE, 'Obligatoire annuellement', '🔥'),
    ('Nettoyer la cave / le grenier', 60, 4, 100, cat_saisonnier, freq_annual, 'cave_grenier', FALSE, 'Désencombrer + vérifier humidité', '🏠'),
    ('Retourner tous les matelas', 30, 3, 60, cat_saisonnier, freq_biannual, NULL, FALSE, 'Alternance tête-pied et recto-verso', '🛏️'),
    ('Laver toutes les couettes et oreillers', 30, 3, 55, cat_saisonnier, freq_biannual, NULL, FALSE, 'Pressings pour les grandes couettes', '🛏️'),
    ('Nettoyer / entretenir les moustiquaires', 20, 2, 35, cat_saisonnier, freq_annual, 'moustiquaires', TRUE, 'Eau savonneuse, vérifier trous', '🪟'),
    ('Détartrage complet (robinets, pommeaux, bouilloire…)', 45, 3, 70, cat_saisonnier, freq_biannual, 'eau_dure', TRUE, 'Vinaigre blanc en quantité industrielle', '💧');

  RAISE NOTICE '✓ Saisonnier: 14 tâches insérées';

  -- ========================================
  -- ■ COLOCATION (10 tâches)
  -- ========================================
  INSERT INTO task_templates (name, duration_minutes, difficulty, base_points, category_id, frequency_id, condition_code, needs_product, tip, icon) VALUES
    ('Nettoyer les espaces communs (tour de rôle)', 20, 2, 35, cat_colocation, freq_weekly, 'colocation', TRUE, 'Planning affiché = pas de conflit', '👥'),
    ('Vider le frigo des aliments périmés (commun)', 10, 1, 20, cat_colocation, freq_weekly, 'colocation', FALSE, 'Chacun étiquette ses aliments avec une date', '🧊'),
    ('Racheter les produits ménagers communs', 15, 1, 20, cat_colocation, freq_monthly, 'colocation', FALSE, 'Cagnotte commune ou à tour de rôle', '🛒'),
    ('Nettoyer la machine à laver commune', 15, 2, 30, cat_colocation, freq_monthly, 'colocation', TRUE, 'Responsabilité tournante', '🧺'),
    ('Gérer le planning des tâches', 10, 1, 15, cat_colocation, freq_weekly, 'colocation', FALSE, 'L''app s''en occupe !', '📋'),
    ('Nettoyer après une soirée / fête', 45, 3, 70, cat_colocation, freq_if_needed, 'colocation', TRUE, 'Le lendemain, ensemble, c''est mieux', '🎉'),
    ('Rangement des espaces partagés', 10, 1, 15, cat_colocation, freq_daily, 'colocation', FALSE, 'Ne pas laisser ses affaires traîner', '🛋️'),
    ('Descendre les poubelles communes', 5, 1, 10, cat_colocation, freq_2_3x_week, 'colocation', FALSE, 'Vérifier le calendrier de collecte', '🗑️'),
    ('Dégivrer le frigo / congélo commun', 20, 2, 40, cat_colocation, freq_quarterly, 'colocation', FALSE, 'Coordonner pour vider le frigo avant', '❄️'),
    ('Inventaire produits ménagers', 10, 1, 15, cat_colocation, freq_monthly, 'colocation', FALSE, 'Liste partagée sur l''appli', '📝');

  RAISE NOTICE '✓ Colocation: 10 tâches insérées';

  -- ========================================
  -- RÉSUMÉ FINAL
  -- ========================================
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ SEED V3 TERMINÉ - 227 TÂCHES INSÉRÉES';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '  Cuisine:       29 tâches';
  RAISE NOTICE '  Salle de bain: 20 tâches';
  RAISE NOTICE '  Chambre:       16 tâches';
  RAISE NOTICE '  Salon:         20 tâches';
  RAISE NOTICE '  Entrée:         8 tâches';
  RAISE NOTICE '  Buanderie:     15 tâches';
  RAISE NOTICE '  Général:       16 tâches';
  RAISE NOTICE '  Robots:        12 tâches';
  RAISE NOTICE '  Extérieur:     24 tâches';
  RAISE NOTICE '  Animaux:       15 tâches';
  RAISE NOTICE '  Enfants:       18 tâches';
  RAISE NOTICE '  Bureau:        10 tâches';
  RAISE NOTICE '  Saisonnier:    14 tâches';
  RAISE NOTICE '  Colocation:    10 tâches';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'TOTAL: 227 tâches avec condition_code';

END $$;
