-- Corriger les frequency_id manquants dans task_templates

-- 1. Vérifier les frequencies disponibles
SELECT 'FREQUENCIES DISPONIBLES' as info, code, label FROM frequencies ORDER BY days_default;

-- 2. Mettre à jour tous les templates sans frequency_id avec une fréquence par défaut
-- On utilise 'weekly' (hebdomadaire) comme défaut raisonnable
UPDATE task_templates
SET frequency_id = (SELECT id FROM frequencies WHERE code = 'weekly' LIMIT 1),
    updated_at = NOW()
WHERE frequency_id IS NULL;

-- 3. Afficher le résultat
SELECT
  'APRÈS CORRECTION' as check,
  COUNT(*) as total_templates,
  COUNT(frequency_id) as has_frequency_id,
  COUNT(*) - COUNT(frequency_id) as null_frequency_id
FROM task_templates;

-- 4. Vérifier que maintenant le JOIN fonctionne
SELECT
  'TÂCHES MAINTENANT SÉLECTIONNABLES' as check,
  COUNT(*) as task_count
FROM household_tasks ht
JOIN task_templates tt ON ht.template_id = tt.id
JOIN frequencies f ON tt.frequency_id = f.id
WHERE ht.household_id = (SELECT id FROM households ORDER BY created_at DESC LIMIT 1)
  AND ht.is_active = true
  AND ht.next_due_at <= CURRENT_DATE;
