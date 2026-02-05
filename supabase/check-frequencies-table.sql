-- Vérifier si la table frequencies a des données

-- 1. Compter les frequencies
SELECT 'TOTAL FREQUENCIES' as check, COUNT(*) as count FROM frequencies;

-- 2. Voir toutes les frequencies
SELECT * FROM frequencies ORDER BY days_default;

-- 3. Tester la sous-requête de l'UPDATE
SELECT 'TEST SUBQUERY' as check, id FROM frequencies WHERE code = 'weekly' LIMIT 1;
