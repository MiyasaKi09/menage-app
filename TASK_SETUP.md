# Configuration du Système de Tâches

## Étape 1: Exécuter les fonctions SQL

Dans le **SQL Editor** de Supabase, exécutez le fichier `supabase/functions.sql` :

```sql
-- Copier-coller le contenu de supabase/functions.sql
```

Cela créera les fonctions nécessaires pour :
- Incrémenter les points du profil
- Incrémenter les statistiques du membre dans le foyer

## Étape 2: Ajouter des tâches de test

1. Allez sur votre application déployée
2. Naviguez vers **/household** pour voir vos foyers
3. Cliquez sur un foyer pour voir son **ID** dans l'URL (par exemple: `/household/123e4567-e89b-12d3-a456-426614174000`)
4. Copiez cet ID

5. Dans Supabase SQL Editor, ouvrez `supabase/seed-tasks.sql`
6. Remplacez **toutes** les occurrences de `'YOUR_HOUSEHOLD_ID'` par votre vrai ID de foyer
7. Exécutez le script

**Exemple:**
```sql
-- Avant:
INSERT INTO household_tasks (household_id, task_template_id, points_value, is_active)
SELECT
  'YOUR_HOUSEHOLD_ID'::uuid,
  ...

-- Après:
INSERT INTO household_tasks (household_id, task_template_id, points_value, is_active)
SELECT
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  ...
```

## Étape 3: Tester l'application

1. Allez sur **/tasks** dans votre application
2. Vous devriez voir environ 20 tâches réparties par catégories
3. Cliquez sur **Compléter** pour une tâche
4. Vérifiez que :
   - Une alerte "✅ Tâche complétée ! +X points" s'affiche
   - Les points sont ajoutés à votre profil (visible sur /dashboard)
   - La tâche apparaît dans l'historique (/tasks/history)

## Étape 4: Vérifier les statistiques

Retournez sur **/dashboard** et vérifiez que :
- **Points Totaux** a augmenté
- **Tâches Complétées** a augmenté
- Dans la section **Mes Foyers**, les points du foyer ont augmenté

## Structure des Tâches

Le système fonctionne comme suit :

1. **task_templates** : 132 tâches prédéfinies (déjà dans la DB)
2. **household_tasks** : Tâches activées pour un foyer spécifique (ce qu'on ajoute avec seed-tasks.sql)
3. **task_history** : Historique des tâches complétées par les utilisateurs

## Ajouter Plus de Tâches

Pour ajouter d'autres tâches, vous pouvez :

1. Voir toutes les tâches disponibles :
```sql
SELECT tt.name, c.name as category, tt.default_points
FROM task_templates tt
JOIN categories c ON tt.category_id = c.id
ORDER BY c.name, tt.name;
```

2. Ajouter une tâche spécifique :
```sql
INSERT INTO household_tasks (household_id, task_template_id, points_value, is_active)
SELECT
  'VOTRE_ID_FOYER'::uuid,
  id,
  default_points,
  true
FROM task_templates
WHERE name = 'Nom de la tâche'
ON CONFLICT DO NOTHING;
```

## Prochaines Fonctionnalités

- ✅ Complétion de tâches
- ✅ Attribution de points
- ✅ Historique des tâches
- 🔜 Tâches récurrentes (quotidiennes, hebdomadaires)
- 🔜 Assignation de tâches à des membres
- 🔜 Système de récompenses
- 🔜 Badges et achievements
