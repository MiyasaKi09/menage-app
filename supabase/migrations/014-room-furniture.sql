-- ============================================
-- MIGRATION 014: Chambre personnalisable — meubles + catalogue
-- ============================================

-- Catalogue global des meubles disponibles
CREATE TABLE IF NOT EXISTS furniture_catalog (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'meubles', 'luminaire', 'fenetres', 'sols-murs', 'deco'
    model_url TEXT, -- chemin vers .glb (null = fallback primitive)
    thumbnail_url TEXT,
    price INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    width NUMERIC(4,2) DEFAULT 1.0,
    depth NUMERIC(4,2) DEFAULT 1.0,
    height NUMERIC(4,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meubles placés dans la chambre d'un joueur
CREATE TABLE IF NOT EXISTS room_furniture (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    catalog_id VARCHAR(50) NOT NULL REFERENCES furniture_catalog(id),
    position_x NUMERIC(6,2) DEFAULT 0,
    position_y NUMERIC(6,2) DEFAULT 0,
    position_z NUMERIC(6,2) DEFAULT 0,
    rotation_y NUMERIC(6,2) DEFAULT 0,
    scale NUMERIC(4,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_furniture_owner ON room_furniture(household_id, profile_id);

-- RLS
ALTER TABLE furniture_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_furniture ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog readable by all authenticated"
    ON furniture_catalog FOR SELECT TO authenticated USING (true);

CREATE POLICY "Room furniture visible by household members"
    ON room_furniture FOR SELECT USING (
        household_id IN (SELECT household_id FROM household_members WHERE profile_id = auth.uid())
    );

CREATE POLICY "Room furniture editable by owner"
    ON room_furniture FOR ALL USING (profile_id = auth.uid());

-- Seed catalogue avec meubles par défaut (fallback primitives, pas de .glb)
INSERT INTO furniture_catalog (id, name, category, price, is_default, width, depth, height) VALUES
('bed_default', 'Lit medieval', 'meubles', 0, TRUE, 1.5, 2.0, 1.2),
('table_default', 'Table de chevet', 'meubles', 0, TRUE, 0.55, 0.45, 0.55),
('shelf_default', 'Etagere murale', 'meubles', 0, TRUE, 0.6, 0.2, 0.3),
('lamp_default', 'Lampe de chevet', 'luminaire', 0, TRUE, 0.2, 0.2, 0.4),
('ceiling_light', 'Suspension', 'luminaire', 0, TRUE, 0.12, 0.12, 0.6),
('plant_small', 'Petite plante', 'deco', 5, FALSE, 0.15, 0.15, 0.2),
('bookshelf', 'Bibliotheque', 'meubles', 15, FALSE, 0.8, 0.3, 1.8),
('chest', 'Coffre', 'meubles', 10, FALSE, 0.7, 0.45, 0.45),
('window_gothic', 'Fenetre gothique', 'fenetres', 0, TRUE, 0.9, 0.25, 1.1),
('rug_small', 'Tapis', 'sols-murs', 8, FALSE, 1.5, 1.0, 0.02)
ON CONFLICT (id) DO NOTHING;
