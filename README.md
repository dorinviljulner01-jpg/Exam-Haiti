# ExamHaiti — Stage 1 (MVP)

Plateforme éducative mobile pour préparer les examens **9e AF** et **NS4** en Haïti.

## Ce qui est inclus dans cette Stage 1

- Page d'accueil (Accueil)
- Page 9e AF (liste des matières)
- Page NS4 (liste des matières)
- Bibliothèque de Documents avec filtres (niveau, gratuit/premium, recherche)
- Quiz interactifs (questions à 4 choix, score, corrections, possibilité de refaire)
- Connexion / Inscription (prêtes pour Supabase, fonctionnent en mode démo sans backend)
- Tableau de bord étudiant (progression par matière)
- Navigation mobile en bas d'écran (Accueil, Documents, Quiz, Progression, Profil)
- Données de démonstration (matières, documents, questions) — clairement fictives

Le **paiement MonCash/NatCash** et le **dashboard administrateur** ne sont **pas** encore
inclus : ce sera la Stage 2 et la Stage 3, comme prévu dans le plan.

## Comment lancer le projet

Ce projet est du code **Next.js**. Il ne peut pas s'ouvrir directement en tapant
sur un fichier depuis ton téléphone — il doit être exécuté sur un ordinateur
(ou dans un environnement de développement dans le cloud), puis mis en ligne
pour que tu puisses l'ouvrir sur ton téléphone via un lien internet.

### Option recommandée : voir le résultat sur ton téléphone sans installer quoi que ce soit

1. Crée un compte gratuit sur [github.com](https://github.com).
2. Crée un nouveau dépôt et mets-y tous les fichiers de ce projet (tu peux
   glisser-déposer le dossier depuis l'interface web de GitHub).
3. Crée un compte gratuit sur [vercel.com](https://vercel.com) et connecte-le
   à ton compte GitHub.
4. Dans Vercel, clique sur "New Project", choisis ton dépôt ExamHaiti, puis
   clique sur "Deploy". Vercel installe et construit le projet automatiquement.
5. Une fois terminé, Vercel te donne un lien (par exemple
   `exam-haiti.vercel.app`) que tu peux ouvrir directement depuis ton
   téléphone Android.

### Option pour un développeur (sur ordinateur)

```bash
# 1. Installer les dépendances
npm install

# 2. (Optionnel pour Stage 1) Configurer Supabase
cp .env.local.example .env.local
# puis remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Lancer le serveur de développement
npm run dev

# 4. Ouvrir http://localhost:3000 dans le navigateur
```

Sans configuration Supabase, la Connexion/Inscription fonctionnent en
**mode démonstration** (elles t'amènent directement au tableau de bord, sans
créer de vrai compte). Dès que tu ajoutes tes clés Supabase dans `.env.local`,
l'authentification devient réelle.

## Base de données (pour la suite)

Le fichier `supabase/schema.sql` contient déjà toute la structure de base de
données prévue pour les prochaines étapes (utilisateurs, documents,
questions, quiz, tentatives, paiements, sécurité RLS). Tu n'as rien à faire
avec ce fichier pour la Stage 1 — il servira quand on ajoutera Supabase pour
de vrai en Stage 2.

## Fichiers créés dans cette étape

```
exam-haiti/
  app/
    layout.tsx, globals.css, page.tsx       → structure générale + Accueil
    9e-af/page.tsx                          → page matières 9e AF
    ns4/page.tsx                            → page matières NS4
    documents/page.tsx                      → bibliothèque de documents + filtres
    quiz/page.tsx                           → liste des quiz
    quiz/[id]/page.tsx                      → quiz interactif (questions, score, corrections)
    login/page.tsx, register/page.tsx       → connexion / inscription
    dashboard/page.tsx                      → tableau de bord étudiant
  components/
    Header.tsx, BottomNav.tsx
    SubjectCard.tsx, DocumentCard.tsx, QuizCard.tsx
  lib/
    supabaseClient.ts                       → connexion Supabase (optionnelle en Stage 1)
    sampleData.ts                           → données de démonstration
  supabase/schema.sql                       → structure de base de données pour la suite
  package.json, tailwind.config.js, tsconfig.json, next.config.js, postcss.config.js
  .env.local.example
```

## Stage 2 — Administration

Nouveau : dashboard admin sur `/admin` (statistiques, étudiants, documents,
questions, quiz). Sans Supabase, il s'ouvre en **mode démo** (rien n'est
sauvegardé). Avec Supabase, il est réservé aux comptes `role = 'admin'`.

### Activer l'admin avec Supabase (gratuit)
1. Crée un projet sur supabase.com.
2. Dans **SQL Editor**, exécute `supabase/schema.sql`, puis `supabase/stage2.sql`.
3. Mets l'URL et la clé "anon" de Supabase dans Vercel
   (Settings > Environment Variables) : `NEXT_PUBLIC_SUPABASE_URL` et
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, puis redéploie.
4. Inscris-toi sur le site, puis exécute dans SQL Editor la ligne
   "premier administrateur" en bas de `stage2.sql` (avec ton email).
5. Ouvre `/admin` : tu peux ajouter documents, questions et quiz.

### Fichiers Stage 2
- Créés : `lib/admin.ts`, `app/admin/layout.tsx`, `app/admin/page.tsx`,
  `app/admin/students/page.tsx`, `app/admin/documents/page.tsx`,
  `app/admin/questions/page.tsx`, `app/admin/quizzes/page.tsx`,
  `supabase/stage2.sql`
- Modifié : `app/documents/page.tsx` (correctif Suspense pour le déploiement)

## Prochaine étape (Stage 3)

Paiement manuel MonCash/NatCash : envoi de capture, approbation/rejet par
l'admin, activation du premium.
