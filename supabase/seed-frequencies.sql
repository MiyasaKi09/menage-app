-- Peupler la table frequencies avec les fréquences standard

-- Insérer les fréquences de base
INSERT INTO frequencies (code, label, days_min, days_max, days_default)
VALUES
  ('daily', 'Quotidien', 1, 1, 1),
  ('2-3x_week', '2-3 fois par semaine', 2, 4, 3),
  ('weekly', 'Hebdomadaire', 7, 7, 7),
  ('biweekly', 'Toutes les 2 semaines', 14, 14, 14),
  ('monthly', 'Mensuel', 28, 31, 30),
  ('quarterly', 'Trimestriel', 84, 92, 90),
  ('biannual', 'Semestriel', 168, 184, 180),
  ('annual', 'Annuel', 350, 380, 365)
ON CONFLICT (code) DO NOTHING;

-- Vérifier le résultat
SELECT 'FREQUENCIES INSÉRÉES' as check, COUNT(*) as count FROM frequencies;

-- Afficher toutes les frequencies
SELECT code, label, days_default FROM frequencies ORDER BY days_default;
