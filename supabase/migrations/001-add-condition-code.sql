-- ============================================
-- Migration 001: Ajouter condition_code à task_templates
-- ============================================
-- Cette colonne permet de lier chaque tâche à une condition
-- de filtrage du questionnaire (97 conditions dans le PDF)

-- Ajouter colonne condition_code
ALTER TABLE task_templates
ADD COLUMN IF NOT EXISTS condition_code VARCHAR(50);

-- Ajouter colonne needs_product (du PDF)
ALTER TABLE task_templates
ADD COLUMN IF NOT EXISTS needs_product BOOLEAN DEFAULT FALSE;

-- Index pour recherche rapide par condition
CREATE INDEX IF NOT EXISTS idx_task_templates_condition
ON task_templates(condition_code);

-- Commentaires
COMMENT ON COLUMN task_templates.condition_code IS 'Code de condition du questionnaire (ex: grille_pain, robot_aspirateur)';
COMMENT ON COLUMN task_templates.needs_product IS 'Indique si la tâche nécessite un produit ménager';
