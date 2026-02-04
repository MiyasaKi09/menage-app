-- ============================================
-- ASSIGN CATEGORIES TO TASK_TEMPLATES
-- ============================================
-- Problem: All task_templates have category_id = NULL
-- Solution: Automatically assign categories based on task names

-- Get category IDs (we'll use them for updates)
DO $$
DECLARE
  cat_cuisine_id UUID;
  cat_salle_bain_id UUID;
  cat_chambre_id UUID;
  cat_salon_id UUID;
  cat_entree_id UUID;
  cat_buanderie_id UUID;
  cat_exterieur_id UUID;
  cat_animaux_id UUID;
  cat_enfants_id UUID;
  cat_saisonnier_id UUID;
  cat_general_id UUID;
BEGIN
  -- Fetch category IDs
  SELECT id INTO cat_cuisine_id FROM categories WHERE name = 'Cuisine';
  SELECT id INTO cat_salle_bain_id FROM categories WHERE name = 'Salle de bain';
  SELECT id INTO cat_chambre_id FROM categories WHERE name = 'Chambre';
  SELECT id INTO cat_salon_id FROM categories WHERE name = 'Salon';
  SELECT id INTO cat_entree_id FROM categories WHERE name = 'Entrée';
  SELECT id INTO cat_buanderie_id FROM categories WHERE name = 'Buanderie';
  SELECT id INTO cat_exterieur_id FROM categories WHERE name = 'Extérieur';
  SELECT id INTO cat_animaux_id FROM categories WHERE name = 'Animaux';
  SELECT id INTO cat_enfants_id FROM categories WHERE name = 'Enfants';
  SELECT id INTO cat_saisonnier_id FROM categories WHERE name = 'Saisonnier';
  SELECT id INTO cat_general_id FROM categories WHERE name = 'Général';

  -- CUISINE
  UPDATE task_templates SET category_id = cat_cuisine_id
  WHERE category_id IS NULL AND (
    name ILIKE '%cuisine%' OR
    name ILIKE '%vaisselle%' OR
    name ILIKE '%four%' OR
    name ILIKE '%frigo%' OR
    name ILIKE '%réfrigérateur%' OR
    name ILIKE '%micro-ondes%' OR
    name ILIKE '%cafetière%' OR
    name ILIKE '%lave-vaisselle%' OR
    name ILIKE '%plan de travail%' OR
    name ILIKE '%évier%' OR
    name ILIKE '%hotte%' OR
    name ILIKE '%congélateur%' OR
    name ILIKE '%placards cuisine%' OR
    name ILIKE '%poubelle%'
  );

  -- SALLE DE BAIN
  UPDATE task_templates SET category_id = cat_salle_bain_id
  WHERE category_id IS NULL AND (
    name ILIKE '%salle de bain%' OR
    name ILIKE '%douche%' OR
    name ILIKE '%baignoire%' OR
    name ILIKE '%toilettes%' OR
    name ILIKE '%WC%' OR
    name ILIKE '%lavabo%' OR
    name ILIKE '%miroir salle%' OR
    name ILIKE '%robinet%' OR
    name ILIKE '%rideau de douche%' OR
    name ILIKE '%pommeau%' OR
    name ILIKE '%meuble salle%' OR
    name ILIKE '%tapis de bain%' OR
    name ILIKE '%aérer la salle%'
  );

  -- CHAMBRE
  UPDATE task_templates SET category_id = cat_chambre_id
  WHERE category_id IS NULL AND (
    name ILIKE '%chambre%' OR
    name ILIKE '%lit%' OR
    name ILIKE '%matelas%' OR
    name ILIKE '%draps%' OR
    name ILIKE '%oreiller%' OR
    name ILIKE '%couette%' OR
    name ILIKE '%couverture%' OR
    name ILIKE '%placard%' OR
    name ILIKE '%armoire%' OR
    name ILIKE '%vêtements%' OR
    name ILIKE '%lampe de chevet%' OR
    name ILIKE '%aérer la chambre%' OR
    name ILIKE '%retourner le matelas%'
  );

  -- SALON
  UPDATE task_templates SET category_id = cat_salon_id
  WHERE category_id IS NULL AND (
    name ILIKE '%salon%' OR
    name ILIKE '%canapé%' OR
    name ILIKE '%télé%' OR
    name ILIKE '%table basse%' OR
    name ILIKE '%tapis salon%' OR
    name ILIKE '%coussins%' OR
    name ILIKE '%étagères%' OR
    name ILIKE '%bibliothèque%' OR
    name ILIKE '%aérer le salon%'
  );

  -- ENTRÉE
  UPDATE task_templates SET category_id = cat_entree_id
  WHERE category_id IS NULL AND (
    name ILIKE '%entrée%' OR
    name ILIKE '%paillasson%' OR
    name ILIKE '%chaussures%' OR
    name ILIKE '%porte-manteau%' OR
    name ILIKE '%porte d''entrée%' OR
    name ILIKE '%couloir%' OR
    name ILIKE '%courrier%' OR
    name ILIKE '%clés%'
  );

  -- BUANDERIE
  UPDATE task_templates SET category_id = cat_buanderie_id
  WHERE category_id IS NULL AND (
    name ILIKE '%linge%' OR
    name ILIKE '%lessive%' OR
    name ILIKE '%machine à laver%' OR
    name ILIKE '%sèche-linge%' OR
    name ILIKE '%étendre%' OR
    name ILIKE '%repasser%' OR
    name ILIKE '%buanderie%'
  );

  -- EXTÉRIEUR
  UPDATE task_templates SET category_id = cat_exterieur_id
  WHERE category_id IS NULL AND (
    name ILIKE '%jardin%' OR
    name ILIKE '%balcon%' OR
    name ILIKE '%terrasse%' OR
    name ILIKE '%extérieur%' OR
    name ILIKE '%plantes extérieur%' OR
    name ILIKE '%pelouse%' OR
    name ILIKE '%haies%' OR
    name ILIKE '%gouttières%' OR
    name ILIKE '%abords%' OR
    name ILIKE '%barbecue%'
  );

  -- ANIMAUX
  UPDATE task_templates SET category_id = cat_animaux_id
  WHERE category_id IS NULL AND (
    name ILIKE '%animal%' OR
    name ILIKE '%chat%' OR
    name ILIKE '%chien%' OR
    name ILIKE '%litière%' OR
    name ILIKE '%gamelle%' OR
    name ILIKE '%panier%' OR
    name ILIKE '%poils%' OR
    name ILIKE '%brosser%' OR
    name ILIKE '%cage%' OR
    name ILIKE '%jouets animal%'
  );

  -- ENFANTS
  UPDATE task_templates SET category_id = cat_enfants_id
  WHERE category_id IS NULL AND (
    name ILIKE '%enfant%' OR
    name ILIKE '%bébé%' OR
    name ILIKE '%jouets%' OR
    name ILIKE '%peluches%' OR
    name ILIKE '%chaise haute%' OR
    name ILIKE '%table à langer%' OR
    name ILIKE '%parc%' OR
    name ILIKE '%tapis d''éveil%' OR
    name ILIKE '%dessins%'
  );

  -- SAISONNIER
  UPDATE task_templates SET category_id = cat_saisonnier_id
  WHERE category_id IS NULL AND (
    name ILIKE '%hiver%' OR
    name ILIKE '%été%' OR
    name ILIKE '%saison%' OR
    name ILIKE '%radiateurs%' OR
    name ILIKE '%ventilateur%' OR
    name ILIKE '%climatisation%' OR
    name ILIKE '%mobilier de jardin%' OR
    name ILIKE '%volets extérieurs%' OR
    name ILIKE '%moustiquaires%' OR
    name ILIKE '%déneiger%'
  );

  -- GÉNÉRAL (pour tout le reste)
  UPDATE task_templates SET category_id = cat_general_id
  WHERE category_id IS NULL;

  RAISE NOTICE 'Categories assigned successfully!';
END $$;

-- Verify results
SELECT
  c.name as category,
  COUNT(tt.id) as task_count
FROM categories c
LEFT JOIN task_templates tt ON c.id = tt.category_id
GROUP BY c.id, c.name
ORDER BY c.display_order;
