-- Table pour stocker les réponses au questionnaire
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Réponses au questionnaire
  housing_type VARCHAR(20) NOT NULL CHECK (housing_type IN ('apartment', 'house')),
  room_count INTEGER NOT NULL CHECK (room_count >= 1 AND room_count <= 10),
  has_outdoor_space BOOLEAN NOT NULL DEFAULT false,
  outdoor_type VARCHAR(20) CHECK (outdoor_type IN ('balcony', 'garden', 'terrace')),
  has_pets BOOLEAN NOT NULL DEFAULT false,
  pet_types TEXT[], -- Array de types d'animaux
  household_size INTEGER NOT NULL CHECK (household_size >= 1 AND household_size <= 15),
  has_children BOOLEAN NOT NULL DEFAULT false,
  cooking_frequency VARCHAR(20) NOT NULL CHECK (cooking_frequency IN ('never', 'rare', 'regular', 'daily')),
  has_dishwasher BOOLEAN NOT NULL DEFAULT false,
  has_washing_machine BOOLEAN NOT NULL DEFAULT false,
  has_dryer BOOLEAN NOT NULL DEFAULT false,

  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un seul questionnaire par foyer
  UNIQUE(household_id)
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_questionnaire_household ON questionnaire_responses(household_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_profile ON questionnaire_responses(profile_id);

-- RLS policies
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Les membres du foyer peuvent voir les réponses
CREATE POLICY "Members can view questionnaire responses"
ON questionnaire_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM household_members
    WHERE household_members.household_id = questionnaire_responses.household_id
    AND household_members.profile_id = auth.uid()
  )
);

-- Les admins peuvent créer/modifier les réponses
CREATE POLICY "Admins can manage questionnaire responses"
ON questionnaire_responses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM household_members
    WHERE household_members.household_id = questionnaire_responses.household_id
    AND household_members.profile_id = auth.uid()
    AND household_members.role = 'admin'
  )
);

-- Fonction pour mettre à jour le updated_at
CREATE OR REPLACE FUNCTION update_questionnaire_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_questionnaire_updated_at
BEFORE UPDATE ON questionnaire_responses
FOR EACH ROW
EXECUTE FUNCTION update_questionnaire_updated_at();

-- Afficher la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'questionnaire_responses'
ORDER BY ordinal_position;
