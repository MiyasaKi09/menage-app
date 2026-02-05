-- ============================================
-- Migration 003: Ajouter 2 nouvelles fréquences
-- ============================================
-- after_use: Après chaque utilisation
-- if_needed: Selon les besoins

INSERT INTO frequencies (code, label, days_min, days_max, days_default)
VALUES
  ('after_use', 'Après usage', 0, 1, 1),
  ('if_needed', 'Si besoin', 0, 365, 30)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  days_min = EXCLUDED.days_min,
  days_max = EXCLUDED.days_max,
  days_default = EXCLUDED.days_default;

-- Vérifier que toutes les fréquences existent
DO $$
BEGIN
  -- S'assurer que les fréquences standard existent
  INSERT INTO frequencies (code, label, days_min, days_max, days_default)
  VALUES
    ('daily', 'Quotidien', 1, 1, 1),
    ('2-3x_week', '2-3 fois par semaine', 2, 4, 3),
    ('weekly', 'Hebdomadaire', 7, 7, 7),
    ('biweekly', 'Toutes les 2 semaines', 14, 14, 14),
    ('monthly', 'Mensuel', 28, 31, 30),
    ('quarterly', 'Trimestriel', 84, 92, 90),
    ('biannual', 'Semestriel', 168, 184, 180),
    ('annual', 'Annuel', 350, 380, 365),
    ('seasonal', 'Saisonnier', 80, 100, 90)
  ON CONFLICT (code) DO NOTHING;
END $$;
