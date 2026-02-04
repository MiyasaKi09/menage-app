-- ============================================
-- INSERT CATEGORIES
-- ============================================
-- Create all the categories needed for the app

INSERT INTO categories (name, emoji, description, display_order) VALUES
('Cuisine', '🍳', 'Vaisselle, électroménager, surfaces, poubelles', 1),
('Salle de bain', '🚿', 'Sanitaires, douche, accessoires, aération', 2),
('Chambre', '🛏️', 'Literie, rangement, dépoussiérage, sols', 3),
('Salon', '🛋️', 'Meubles, sols, vitres, décoration', 4),
('Entrée', '🚪', 'Sols, rangement, porte, couloirs', 5),
('Buanderie', '🧺', 'Linge, machines, repassage', 6),
('Extérieur', '🌿', 'Balcon, terrasse, jardin, garage', 7),
('Général', '🏠', 'Transversal, aération, maintenance', 8),
('Animaux', '🐾', 'Litière, gamelles, poils, cages', 9),
('Enfants', '👶', 'Jouets, hygiène, équipements bébé', 10),
('Saisonnier', '🗓️', 'Tâches annuelles, changements de saison', 11)
ON CONFLICT (name) DO NOTHING;

SELECT 'Categories inserted successfully!' as status;
SELECT * FROM categories ORDER BY display_order;
