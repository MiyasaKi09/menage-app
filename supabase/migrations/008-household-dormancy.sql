-- Ajouter le statut actif/dormant sur les adhésions aux fiefs
-- Permet à un utilisateur (ex: ado avec parents séparés) de mettre en pause sa participation
ALTER TABLE household_members
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'; -- 'active', 'dormant'

-- Mode accompagnateur : un adulte gère un enfant sans téléphone
ALTER TABLE household_members
  ADD COLUMN IF NOT EXISTS companion_of UUID REFERENCES profiles(id); -- null = membre normal
