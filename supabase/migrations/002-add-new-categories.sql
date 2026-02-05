-- ============================================
-- Migration 002: Ajouter 3 nouvelles catégories
-- ============================================
-- Robots (12 tâches), Bureau (10 tâches), Colocation (10 tâches)

INSERT INTO categories (name, emoji, description, display_order)
VALUES
  ('Robots', '🤖', 'Maintenance des robots ménagers (aspirateur, laveur, tondeuse)', 12),
  ('Bureau', '💼', 'Espace de travail, ordinateur, organisation', 13),
  ('Colocation', '👥', 'Tâches spécifiques à la vie en colocation', 14)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;
