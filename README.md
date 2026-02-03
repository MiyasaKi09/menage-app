# 🏠 Ménage App

Application de gamification du ménage construite avec Next.js, Supabase et TypeScript.

## 📋 À propos

Ménage App transforme les corvées ménagères en jeu collectif. Gagnez des points, accomplissez des quêtes et progressez avec votre foyer.

### Fonctionnalités

- ✅ **Authentification complète** (inscription, connexion, déconnexion)
- ✅ **Dashboard personnalisé** avec statistiques
- ✅ **Protection des routes** avec middleware
- ✅ **Composants UI réutilisables**
- 🚧 **Questionnaire initial** (à venir)
- 🚧 **Gestion des foyers** (à venir)
- 🚧 **Système de tâches** (à venir)
- 🚧 **Gamification** (points, niveaux, badges)

## 🛠️ Stack Technique

- **Framework**: Next.js 16+ (App Router)
- **Langage**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Formulaires**: React Hook Form + Zod
- **Hébergement**: Vercel

## 📦 Prérequis

- Node.js 18 ou supérieur
- Un compte Supabase (gratuit)
- Un compte Vercel (gratuit, pour le déploiement)
- Git

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone <votre-repo-url>
cd menage-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous avec votre compte (ou créez-en un)
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name**: menage-app
   - **Database Password**: (choisissez un mot de passe fort)
   - **Region**: Europe-West (ou le plus proche de vous)
5. Cliquez sur "Create new project"
6. Attendez quelques minutes que le projet soit créé

#### Déployer le schéma SQL

1. Dans votre projet Supabase, allez dans **SQL Editor** (menu de gauche)
2. Cliquez sur "New Query"
3. Ouvrez le fichier [supabase/schema.sql](supabase/schema.sql) dans votre éditeur
4. Copiez tout le contenu du fichier
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur "Run" (ou Ctrl+Enter)
7. Vérifiez qu'il n'y a pas d'erreurs dans la console
8. Allez dans **Table Editor** pour vérifier que les tables sont bien créées

Vous devriez voir environ 20 tables créées :
- `profiles`, `categories`, `frequencies`, `task_templates`
- `households`, `household_members`, `household_tasks`
- `scheduled_tasks`, `task_history`
- `achievements`, `avatars`, `levels`, `streaks`
- `rewards_earned`, `reward_types`
- `notifications`, `motivational_messages`
- `profile_questionnaire`, `profile_achievements`

#### Configurer l'authentification

1. Dans Supabase, allez dans **Authentication** > **URL Configuration**
2. Ajoutez les URLs suivantes dans **Redirect URLs**:
   ```
   http://localhost:3000/api/auth/callback
   https://votre-domaine.vercel.app/api/auth/callback
   ```
   (Remplacez `votre-domaine` par votre domaine Vercel une fois déployé)
3. Dans **Site URL**, mettez:
   - Dev: `http://localhost:3000`
   - Prod: `https://votre-domaine.vercel.app`

#### Récupérer les clés API

1. Allez dans **Settings** > **API**
2. Notez les informations suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon/public key** : `eyJxxx...`
   - **service_role key** : `eyJxxx...` (gardez-la secrète!)

### 4. Configuration des variables d'environnement

1. Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

2. Ouvrez [.env.local](.env.local) et remplissez avec vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...votre-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Lancer l'application en développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🧪 Tester l'application

### Test 1: Page d'accueil
- Ouvrez [http://localhost:3000](http://localhost:3000)
- Vous devriez voir la landing page avec les boutons "Connexion" et "S'inscrire"

### Test 2: Inscription
1. Cliquez sur "S'inscrire"
2. Remplissez le formulaire
3. Cliquez sur "S'inscrire"
4. Vous devriez être redirigé vers `/questionnaire`
5. Vérifiez dans Supabase > **Authentication** > **Users** que votre utilisateur est créé
6. Vérifiez dans **Table Editor** > **profiles** que votre profil est créé

### Test 3: Connexion
1. Allez sur [http://localhost:3000/login](http://localhost:3000/login)
2. Connectez-vous avec vos identifiants
3. Vous devriez être redirigé vers `/dashboard`
4. Votre nom d'affichage et vos stats (0 points, 0 tâches, niveau 1) devraient s'afficher

### Test 4: Protection des routes
1. Déconnectez-vous
2. Essayez d'accéder directement à [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
3. Vous devriez être automatiquement redirigé vers `/login`

## 🌐 Déploiement sur Vercel

### 1. Préparer le dépôt GitHub

Si ce n'est pas déjà fait :

```bash
git add .
git commit -m "Initial commit - Ménage App base setup"
git push origin main
```

### 2. Connecter à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur "Add New..." > "Project"
4. Sélectionnez votre dépôt `menage-app`
5. Cliquez sur "Import"

### 3. Configurer les variables d'environnement

Dans la page de configuration Vercel :

1. Cliquez sur "Environment Variables"
2. Ajoutez les 3 variables suivantes :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJxxx...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx...` |

3. Cliquez sur "Deploy"

### 4. Mettre à jour Supabase avec l'URL Vercel

Une fois déployé :

1. Copiez votre URL Vercel (ex: `https://menage-app.vercel.app`)
2. Retournez dans Supabase > **Authentication** > **URL Configuration**
3. Mettez à jour **Site URL** avec votre URL Vercel
4. Ajoutez dans **Redirect URLs** : `https://votre-domaine.vercel.app/api/auth/callback`

### 5. Tester en production

- Allez sur votre URL Vercel
- Testez l'inscription et la connexion
- Tout devrait fonctionner comme en local !

## 📁 Structure du Projet

```
menage-app/
├── app/
│   ├── (auth)/              # Routes d'authentification
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/         # Routes protégées
│   │   ├── dashboard/
│   │   └── questionnaire/
│   ├── api/
│   │   └── auth/           # Routes API auth
│   ├── layout.tsx          # Layout racine
│   ├── page.tsx            # Landing page
│   └── globals.css         # Styles globaux
├── components/
│   ├── auth/               # Composants d'authentification
│   ├── layout/             # Composants de layout
│   └── ui/                 # Composants UI réutilisables
├── hooks/
│   └── useAuth.ts          # Hook d'authentification
├── lib/
│   ├── supabase/           # Configuration Supabase
│   ├── utils/              # Utilities
│   └── validations/        # Schémas Zod
├── supabase/
│   └── schema.sql          # Schéma de base de données
├── types/
│   └── database.types.ts   # Types TypeScript
├── middleware.ts           # Middleware Next.js
├── .env.example            # Template des variables d'env
├── .env.local             # Variables d'environnement (git-ignored)
└── README.md               # Ce fichier
```

## 🔧 Scripts Disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Construire pour la production
- `npm start` - Lancer le serveur de production
- `npm run lint` - Linter le code

## 🎯 Prochaines Étapes

Fonctionnalités à développer :

### Phase Future 1: Questionnaire Initial
- Formulaire multi-étapes pour collecter les informations du foyer
- Sauvegarde dans `profile_questionnaire`
- Algorithme de personnalisation des tâches

### Phase Future 2: Gestion des Foyers
- Créer un foyer
- Générer un code d'invitation
- Rejoindre un foyer
- Gérer les membres

### Phase Future 3: Système de Tâches
- Afficher la bibliothèque des 132 tâches
- Personnaliser les tâches par foyer
- Todo list quotidienne
- Complétion et attribution de points

### Phase Future 4: Gamification
- Calcul des points avec bonus streak
- Système de niveaux et progression
- Avatars débloquables
- Badges et achievements

### Phase Future 5: Récompenses Sociales
- Définir les récompenses du foyer
- Débloquer et réclamer
- Notifications

## 🐛 Dépannage

### Erreur "Invalid API key"
- Vérifiez que les clés dans `.env.local` sont correctes
- Assurez-vous qu'il n'y a pas d'espaces avant ou après les clés

### Erreur lors de l'inscription
- Vérifiez que le schéma SQL a bien été exécuté dans Supabase
- Vérifiez que RLS est activé sur la table `profiles`
- Regardez les logs dans Supabase > **Logs** > **Postgres Logs**

### Page blanche après connexion
- Vérifiez la console du navigateur (F12)
- Vérifiez que l'utilisateur existe dans `auth.users` ET dans `profiles`

### Redirection infinie
- Videz le cache du navigateur
- Vérifiez le middleware dans [middleware.ts](middleware.ts)

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

Fait avec ❤️ pour faciliter la vie des foyers
