-- Boutique / Négoce : objets achetables avec les pièces d'or pour personnaliser la chambre 3D

CREATE TABLE IF NOT EXISTS shop_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES shop_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  image_url VARCHAR(255),
  item_type VARCHAR(30) NOT NULL, -- 'furniture', 'wallpaper', 'decor', 'lighting', 'floor', 'textile'
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchased_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  is_placed BOOLEAN DEFAULT FALSE
);

-- Seed des catégories du wireframe
INSERT INTO shop_categories (name, display_order) VALUES
  ('Marchandise', 1),
  ('Papiers peint', 2),
  ('Cheminees', 3),
  ('Lits', 4),
  ('Bureau', 5),
  ('Coffre', 6),
  ('Plantes', 7),
  ('Mini-serres', 8),
  ('Bougies', 9),
  ('Bibliotheques', 10),
  ('Vases', 11),
  ('Bouquets', 12),
  ('Commodes', 13),
  ('Lustres / Lumieres', 14),
  ('Fenetres / Vitraux', 15),
  ('Sols', 16),
  ('Tapisseries', 17)
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop categories visible to all authenticated" ON shop_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Shop items visible to all authenticated" ON shop_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users see own purchases" ON purchased_items
  FOR SELECT TO authenticated USING (auth.uid() = profile_id);

CREATE POLICY "Users can purchase items" ON purchased_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
