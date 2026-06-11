# Nexus Noir Web

Site officiel de publication, de lecture et d'administration des nouvelles de l'univers Nexus Noir.

Nexus Noir Web est une plateforme de lecture sombre, mobile first et modulaire. Le but est de publier des nouvelles, suivre leurs statistiques, permettre aux lecteurs de commenter, liker, réagir, débloquer des badges et interagir avec l'univers sans que le site devienne un simple blog froid et impersonnel.

Le site doit être pensé comme une porte d'entrée dans Nexus Noir. Chaque nouvelle doit ressembler à une archive retrouvée dans une ville malade. Chaque compte lecteur doit donner l'impression d'exister dans cet univers.

## Objectifs du projet

Créer une plateforme complète pour publier, gérer et faire vivre les nouvelles Nexus Noir.

Le site doit permettre de

1. publier des nouvelles Nexus Noir
2. écrire les nouvelles directement depuis une interface d'administration
3. gérer les brouillons, corrections, chapitres et versions
4. suivre les vues, lectures complètes, likes et commentaires
5. créer une expérience communautaire ludique
6. gérer les comptes utilisateurs, rôles et permissions
7. attribuer des badges selon les actions des lecteurs
8. permettre le partage propre sur les réseaux sociaux
9. garantir une architecture modulaire, propre et maintenable
10. déployer facilement le projet en production

## Stack technique recommandée

### Backend

La stack recommandée côté backend est

1. Laravel
2. PostgreSQL
3. Redis
4. Laravel Sanctum
5. Laravel Queues
6. Laravel Scheduler
7. Storage compatible S3 pour les images et médias
8. Docker pour le développement et la production

Laravel est choisi parce qu'il permet de construire rapidement une API solide, sécurisée, claire et maintenable. Il gère très bien l'authentification, les permissions, les migrations, les jobs, les files d'attente, les validations et l'administration.

### Frontend

La stack recommandée côté frontend est

1. Next.js
2. React
3. TypeScript
4. Tailwind CSS
5. TanStack Query
6. Zustand ou Jotai pour les états simples
7. Zod pour la validation côté front
8. API client généré depuis OpenAPI

Next.js est préféré à un React Vite classique pour trois raisons principales.

Le SEO est meilleur pour les pages publiques. Les nouvelles doivent être bien visibles quand elles sont partagées. Les pages peuvent avoir des métadonnées propres, des images Open Graph, des titres, des descriptions et des liens propres pour les réseaux sociaux.

### Éditeur de nouvelles

L'éditeur doit être maison, basé sur un format JSON interne.

Pas de gros plugin WYSIWYG opaque. Pas d'éditeur sale impossible à maintenir. L'objectif est de créer un éditeur contrôlé, propre, adapté à Nexus Noir.

L'éditeur doit gérer

1. titres
2. paragraphes
3. citations
4. dialogues
5. séparateurs de scène
6. notes d'auteur
7. avertissements de contenu
8. blocs lore
9. images d'ambiance
10. brouillons
11. sauvegarde automatique
12. historique des versions
13. prévisualisation mobile
14. export Markdown
15. export HTML propre

Le contenu source est stocké en JSON. Le Markdown et le HTML sont générés depuis ce JSON.

## Vision produit

Le site ne doit pas être uniquement un endroit où on lit du texte. Il doit devenir un espace vivant autour de Nexus Noir.

Un lecteur peut créer un compte, lire des nouvelles, réagir, commenter, débloquer des badges, suivre ses lectures et partager ses nouvelles préférées.

L'administration permet à l'auteur de tout gérer sans toucher au code.

## Fonctionnalités principales

## Module Auth

Gestion des comptes utilisateurs.

Fonctionnalités prévues

1. inscription
2. connexion
3. déconnexion
4. mot de passe oublié
5. vérification email
6. profil utilisateur
7. avatar
8. pseudo public
9. préférences de lecture
10. suppression de compte
11. bannissement
12. suspension temporaire

Rôles prévus

1. visiteur
2. lecteur
3. modérateur
4. éditeur
5. administrateur
6. super administrateur

## Module Nouvelles

Gestion complète des nouvelles Nexus Noir.

Une nouvelle contient

1. titre
2. slug
3. résumé court
4. résumé long
5. image de couverture
6. statut
7. contenu JSON
8. contenu HTML généré
9. contenu Markdown généré
10. temps de lecture estimé
11. nombre de mots
12. tags
13. thèmes
14. avertissements de contenu
15. date de publication
16. visibilité
17. statistiques
18. auteur
19. version

Statuts possibles

1. brouillon
2. en correction
3. prêt à publier
4. publié
5. archivé
6. privé

Visibilités possibles

1. public
2. connecté uniquement
3. privé
4. accès anticipé
5. masqué

## Module Éditeur

Éditeur maison pour écrire les nouvelles directement dans l'administration.

Objectifs

1. écrire sans friction
2. garder un rendu propre
3. éviter les bugs de mise en page
4. permettre une prévisualisation fidèle
5. sauvegarder automatiquement
6. conserver l'historique
7. permettre de revenir à une ancienne version
8. gérer les blocs spéciaux de Nexus Noir

Blocs disponibles au départ

1. titre
2. sous titre
3. paragraphe
4. dialogue
5. pensée interne
6. citation
7. note d'auteur
8. avertissement
9. séparateur de scène
10. image
11. bloc lore
12. bloc archive
13. bloc transmission
14. bloc dossier confidentiel

Exemple de bloc JSON

```json
{
  "type": "paragraph",
  "content": [
    {
      "type": "text",
      "text": "La pluie tombait sur Nexus Noir comme si le ciel essayait de laver un crime trop ancien."
    }
  ]
}
```

Le rendu public ne dépend jamais directement du HTML écrit par l'utilisateur. Le site transforme le JSON en HTML propre, contrôlé et sécurisé.

## Module Statistiques

Suivi des vues et lectures.

Statistiques à suivre

1. vues totales
2. vues uniques
3. vues par jour
4. vues par semaine
5. vues par mois
6. temps moyen de lecture
7. taux de lecture complète
8. scroll moyen
9. likes
10. commentaires
11. partages
12. provenance du trafic
13. appareil utilisé
14. navigateur
15. pays approximatif si autorisé

Le système doit éviter de compter n'importe quoi.

Une vue doit être considérée comme valide si

1. la page est ouverte plus de quelques secondes
2. l'utilisateur n'est pas un bot évident
3. la même personne ne recharge pas la page en boucle
4. l'adresse IP est hashée et jamais stockée en clair
5. les statistiques respectent la confidentialité des utilisateurs

## Module Commentaires

Commentaires ludiques et adaptés à Nexus Noir.

Objectifs

1. commenter une nouvelle
2. répondre à un commentaire
3. liker un commentaire
4. signaler un commentaire
5. modérer les abus
6. épingler un commentaire
7. masquer un commentaire
8. supprimer un commentaire
9. afficher les commentaires les plus intéressants
10. éviter les discussions toxiques inutiles

Types de réactions possibles

1. j'ai pris une claque
2. ça m'a mis mal
3. je veux la suite
4. théorie
5. passage préféré
6. malaise réussi
7. archive validée

Les réactions doivent être plus immersives qu'un simple coeur ou pouce bleu.

## Module Likes et Réactions

Chaque nouvelle peut recevoir plusieurs types de réactions.

Réactions possibles

1. claque
2. malaise
3. frisson
4. colère
5. chef d'oeuvre
6. trop réel
7. j'ai peur pour la suite

L'idée est de donner une identité Nexus Noir au système d'engagement.

## Module Badges

Système de badges pour rendre la lecture plus ludique.

Exemples de badges

1. Premier contact
   Débloqué après la création du compte

2. Lecteur des ruelles
   Débloqué après 3 nouvelles lues

3. Témoin gênant
   Débloqué après 10 nouvelles lues

4. Archiviste de Nexus Noir
   Débloqué après 20 nouvelles lues

5. Théoricien malade
   Débloqué après 5 commentaires avec le tag théorie

6. Dernier survivant du chapitre
   Débloqué après une lecture complète d'une nouvelle longue

7. Complice silencieux
   Débloqué après 10 likes donnés

8. Propagateur
   Débloqué après 5 partages

9. Ancien du béton
   Débloqué après 30 jours d'activité

10. Lecteur de nuit
    Débloqué après une lecture entre minuit et 4h du matin

Les badges doivent être configurables depuis l'administration.

Chaque badge contient

1. nom
2. description
3. condition
4. icône
5. rareté
6. statut actif ou inactif
7. ordre d'affichage

Raretés possibles

1. commun
2. rare
3. épique
4. légendaire
5. interdit

## Module Administration

L'administration doit permettre de tout gérer.

Sections prévues

1. tableau de bord
2. nouvelles
3. brouillons
4. éditeur
5. commentaires
6. signalements
7. utilisateurs
8. rôles
9. badges
10. statistiques
11. médias
12. tags
13. thèmes
14. pages statiques
15. paramètres du site
16. intégrations sociales
17. logs d'audit
18. sauvegardes

Le tableau de bord affiche

1. vues du jour
2. vues de la semaine
3. nouvelles les plus lues
4. commentaires récents
5. signalements ouverts
6. nouveaux comptes
7. badges les plus débloqués
8. lectures complètes
9. partages sociaux

## Module Médias

Gestion des images et fichiers.

Fonctionnalités

1. upload image
2. compression
3. recadrage
4. génération de miniatures
5. texte alternatif
6. galerie média
7. suppression sécurisée
8. stockage local en développement
9. stockage S3 en production

Types de médias

1. couverture de nouvelle
2. image Open Graph
3. image de bloc
4. avatar utilisateur
5. icône de badge
6. illustration lore

## Module Réseaux sociaux

Intégration pour partager les nouvelles et promouvoir Nexus Noir.

Fonctionnalités

1. image Open Graph par nouvelle
2. titre social personnalisé
3. description sociale personnalisée
4. bouton partager
5. liens vers les réseaux Nexus Noir
6. génération d'extraits courts
7. génération de phrases d'accroche
8. tracking des partages
9. page spéciale pour les liens bio
10. prévisualisation du rendu social dans l'administration

Réseaux prévus

1. Instagram
2. TikTok
3. X
4. Bluesky
5. Threads
6. Facebook
7. Discord
8. YouTube

## Module Univers Nexus Noir

Ce module sert à enrichir l'univers.

Fonctionnalités prévues

1. fiches de personnages
2. lieux
3. factions
4. concepts politiques
5. événements historiques
6. chronologie
7. liens entre nouvelles
8. dossiers confidentiels
9. archives publiques
10. archives cachées

Ce module peut devenir une sorte de wiki interne, mais contrôlé par l'administration.

Chaque nouvelle peut être liée à

1. personnages
2. lieux
3. factions
4. événements
5. thèmes
6. autres nouvelles

## Architecture du projet

Le projet est organisé en monorepo.

```txt
nexus-noir-web/
  apps/
    api/
    web/
  packages/
    editor-core/
    editor-react/
    shared-types/
    ui/
  docker/
  docs/
  README.md
```

## Backend Laravel

```txt
apps/api/
  app/
    Modules/
      Auth/
      Stories/
      Editor/
      Comments/
      Reactions/
      Badges/
      Stats/
      Media/
      Admin/
      Social/
      Universe/
    Support/
    Shared/
  database/
    migrations/
    seeders/
    factories/
  routes/
    api.php
    admin.php
  tests/
    Feature/
    Unit/
```

Chaque module doit avoir sa propre logique.

Exemple

```txt
app/Modules/Stories/
  Domain/
    Models/
    Enums/
    Policies/
  Application/
    Actions/
    DTO/
    Services/
  Infrastructure/
    Repositories/
  Http/
    Controllers/
    Requests/
    Resources/
  Database/
    Migrations/
    Seeders/
```

Le but est d'éviter les contrôleurs énormes et les fichiers fourre tout.

## Frontend Next.js

```txt
apps/web/
  src/
    app/
      page.tsx
      nouvelles/
      admin/
      compte/
    modules/
      auth/
      stories/
      editor/
      comments/
      badges/
      stats/
      media/
      universe/
      social/
    components/
    lib/
    styles/
    config/
```

Chaque module front contient

```txt
modules/stories/
  api/
  components/
  hooks/
  types/
  utils/
  views/
```

## Packages partagés

```txt
packages/editor-core/
  src/
    schema/
    commands/
    serializer/
    parser/
    validation/
```

```txt
packages/editor-react/
  src/
    components/
    hooks/
    renderers/
```

```txt
packages/shared-types/
  src/
    api/
    models/
    enums/
```

```txt
packages/ui/
  src/
    Button.tsx
    Card.tsx
    Modal.tsx
    Input.tsx
    Badge.tsx
```

## Base de données

Base recommandée

PostgreSQL

Pourquoi PostgreSQL

1. fiable
2. robuste
3. excellent pour les relations
4. bon support JSON
5. bon support full text search
6. adapté aux statistiques
7. facile à sauvegarder

Tables principales

```txt
users
roles
permissions
stories
story_versions
story_blocks
story_views
story_reactions
comments
comment_reactions
badges
badge_rules
user_badges
media
tags
story_tags
universe_entries
universe_entry_links
social_shares
audit_logs
settings
```

## Sécurité

Mesures obligatoires

1. authentification sécurisée avec cookies HTTP only
2. protection CSRF
3. rate limiting sur la connexion et les commentaires
4. validation stricte des entrées
5. permissions Laravel Policies
6. rôles séparés
7. logs d'audit pour l'administration
8. hash des IP pour les statistiques
9. HTML jamais stocké sans nettoyage
10. contenu public généré depuis le JSON contrôlé
11. protection XSS
12. protection SQL injection via Eloquent et Query Builder
13. headers de sécurité
14. Content Security Policy
15. stockage sécurisé des secrets
16. sauvegardes automatiques
17. modération des commentaires
18. vérification email
19. limitation des uploads
20. scan basique des fichiers uploadés

## API

L'API doit être versionnée.

```txt
/api/v1/auth
/api/v1/stories
/api/v1/comments
/api/v1/reactions
/api/v1/badges
/api/v1/stats
/api/v1/media
/api/v1/universe
/api/v1/admin
```

Exemples de routes publiques

```txt
GET /api/v1/stories
GET /api/v1/stories/{slug}
POST /api/v1/stories/{slug}/view
POST /api/v1/stories/{slug}/react
GET /api/v1/stories/{slug}/comments
POST /api/v1/stories/{slug}/comments
```

Exemples de routes admin

```txt
GET /api/v1/admin/dashboard
POST /api/v1/admin/stories
PATCH /api/v1/admin/stories/{id}
POST /api/v1/admin/stories/{id}/publish
POST /api/v1/admin/media
GET /api/v1/admin/stats
GET /api/v1/admin/audit-logs
```

## Éditeur maison

Le contenu d'une nouvelle est stocké comme un document structuré.

Exemple

```json
{
  "version": 1,
  "title": "Le Dernier Verre",
  "blocks": [
    {
      "id": "block_01",
      "type": "heading",
      "level": 1,
      "content": "Le Dernier Verre"
    },
    {
      "id": "block_02",
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Nexus Noir brûlait en silence sous la terrasse éventrée."
        }
      ]
    },
    {
      "id": "block_03",
      "type": "scene_break"
    }
  ]
}
```

Avantages

1. rendu contrôlé
2. export possible
3. sécurité renforcée
4. historique propre
5. compatibilité mobile
6. possibilité d'ajouter des blocs propres à Nexus Noir
7. pas de dépendance à un éditeur externe lourd

## Design

Direction artistique

1. sombre
2. brutal
3. lisible
4. mobile first
5. cinématographique
6. urbain
7. politique
8. légèrement oppressant
9. élégant sans devenir trop propre

Le site doit avoir une identité forte mais rester agréable à lire.

Modes de lecture

1. clair
2. sombre
3. noir profond
4. sépia sale
5. police dyslexie friendly en option
6. taille de texte ajustable
7. largeur de lecture ajustable

## Mobile first

Le mobile est prioritaire.

Contraintes

1. lecture confortable sur petit écran
2. boutons assez grands
3. commentaires faciles à lire
4. administration utilisable sur tablette
5. éditeur utilisable sur desktop en priorité
6. prévisualisation mobile obligatoire dans l'éditeur
7. chargement rapide
8. images optimisées
9. navigation basse sur mobile
10. mode lecture sans distraction

## Déploiement

Déploiement recommandé

1. VPS simple au départ
2. Docker Compose
3. Nginx ou Caddy en reverse proxy
4. PostgreSQL
5. Redis
6. Laravel API
7. Laravel queue worker
8. Laravel scheduler
9. Next.js web app
10. stockage S3 compatible pour les médias
11. sauvegarde automatique de la base
12. sauvegarde automatique des médias

Exemple de services Docker

```txt
api
web
postgres
redis
queue
scheduler
reverse-proxy
```

## Variables d'environnement

Backend

```env
APP_NAME="Nexus Noir"
APP_ENV=production
APP_KEY=
APP_URL=https://api.nexus-noir.ch

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=nexus_noir
DB_USERNAME=nexus_noir
DB_PASSWORD=

REDIS_HOST=redis

SANCTUM_STATEFUL_DOMAINS=nexus-noir.ch,www.nexus-noir.ch
SESSION_DOMAIN=.nexus-noir.ch

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
AWS_ENDPOINT=
```

Frontend

```env
NEXT_PUBLIC_SITE_URL=https://nexus-noir.ch
NEXT_PUBLIC_API_URL=https://api.nexus-noir.ch/api/v1
```

## Commandes de développement

Installation backend

```bash
cd apps/api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Installation frontend

```bash
cd apps/web
pnpm install
pnpm dev
```

Lancement Docker local

```bash
docker compose up -d
```

Tests backend

```bash
php artisan test
```

Tests frontend

```bash
pnpm test
```

Build frontend

```bash
pnpm build
```

## Qualité de code

Backend

1. PHPStan
2. Laravel Pint
3. tests unitaires
4. tests feature
5. migrations propres
6. policies obligatoires
7. Form Requests obligatoires
8. Resources API obligatoires

Frontend

1. ESLint
2. Prettier
3. TypeScript strict
4. tests composants
5. tests end to end plus tard
6. composants accessibles
7. validation Zod
8. modules séparés

## Roadmap MVP

## Phase 1

Objectif

Avoir une première version publiable.

Fonctionnalités

1. page d'accueil
2. liste des nouvelles
3. page détail d'une nouvelle
4. administration simple
5. création et édition de nouvelle
6. publication
7. statistiques de vues basiques
8. comptes utilisateurs
9. connexion
10. likes simples
11. commentaires simples
12. responsive mobile
13. déploiement Docker

## Phase 2

Objectif

Rendre le site vivant.

Fonctionnalités

1. badges
2. réactions immersives
3. commentaires avancés
4. profils utilisateurs
5. statistiques avancées
6. prévisualisation sociale
7. images Open Graph personnalisées
8. modération
9. signalements
10. historique des versions

## Phase 3

Objectif

Renforcer l'univers Nexus Noir.

Fonctionnalités

1. module lore
2. personnages
3. lieux
4. factions
5. chronologie
6. liens entre nouvelles
7. archives cachées
8. badges secrets
9. événements communautaires
10. pages spéciales réseaux sociaux

## Phase 4

Objectif

Passer sur une plateforme complète.

Fonctionnalités

1. notifications
2. newsletters
3. accès anticipé
4. collections de nouvelles
5. recommandations personnalisées
6. recherche avancée
7. statistiques auteur poussées
8. exports complets
9. système de saisons ou cycles narratifs
10. API publique limitée

## Idées de noms internes pour les modules Nexus Noir

Stories devient Archives

Comments devient Murmures

Badges devient Marques

Stats devient Surveillance

Universe devient Cartographie

Admin devient Bureau Noir

Reactions devient Impacts

Editor devient Salle d'écriture

Media devient Preuves

Users devient Citoyens

Ces noms peuvent être utilisés dans l'interface publique pour renforcer l'ambiance, tout en gardant des noms techniques clairs dans le code.

## Priorités techniques

À faire en premier

1. architecture du monorepo
2. Docker local
3. Laravel API
4. base PostgreSQL
5. authentification
6. modèle Story
7. rendu public des nouvelles
8. administration minimale
9. éditeur JSON simple
10. tracking des vues

À ne pas faire trop tôt

1. badges trop complexes
2. notifications
3. recommandations intelligentes
4. paiement
5. application mobile native
6. moteur social complet
7. messagerie privée

## Philosophie du projet

Nexus Noir Web doit être construit proprement dès le départ.

Pas de blog WordPress maquillé. Pas de thème acheté. Pas de plugin qui décide de la structure du contenu. Pas de tableau d'administration bancal. Pas de dette technique volontaire dès la première version.

Le projet doit être simple à lancer, mais assez solide pour évoluer.

Le site doit pouvoir commencer petit, avec quelques nouvelles, puis devenir progressivement une vraie plateforme autour de l'univers Nexus Noir.

## Résultat attendu

À terme, le site doit permettre à un lecteur de découvrir Nexus Noir, lire les nouvelles dans de bonnes conditions, réagir, commenter, débloquer des badges et partager les textes.

Côté auteur, il doit permettre d'écrire, corriger, publier, suivre les statistiques, gérer la communauté et enrichir l'univers depuis une administration claire.

Nexus Noir Web n'est pas seulement un site de nouvelles.

C'est l'entrée officielle dans une ville qui regarde ses lecteurs droit dans les yeux.
