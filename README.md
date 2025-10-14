# Font Ninja - Service de Scraping d'Articles

API REST pour le scraping et la gestion d'articles de presse.

## Prérequis
- Node.js 18+
- Docker & Docker Compose

## Installation

### Option 1: Installation avec Docker (Recommandé)

```bash
# 1. Démarrer tous les services
docker-compose up -d

# 2. Exécuter les migrations
npm run migration:run

# 3. Générer les données de seed
npm run seed:run

```

## Tests

```bash
# En local
npm test
npm run test:cov
```
## API Documentation

Documentation Swagger disponible sur:
```
http://localhost:3000/api
```
## Endpoints Principaux

- `GET /articles` - Liste des articles (pagination, filtres)
  - Paramètre `title` : recherche par mots-clés dans le titre
- `POST /articles/scrape` - Lancer le scraping
```
# scrape - Hacker News
curl --location 'localhost:3000/articles/scrape' \
--header 'Content-Type: application/json' \
--data '{
  "sourceId": "bfe2872e-0b31-4552-8ed8-fba41bca6cfd",
  "uri": "?p=1"
}'

# scrape - BBC News
curl --location 'localhost:3000/articles/scrape' \
--header 'Content-Type: application/json' \
--data '{
  "sourceId": "bfe2872e-0b31-4552-8ed8-fba41bca6cfd",
  "uri": ""
}'

# scrape list
curl --location 'localhost:3000/articles?page=1&pageSize=100'

# scrape list with filter
curl --location 'localhost:3000/articles?page=1&pageSize=100&publishedAfter=2025-10-07&createdAt=DESC'

```

**Architecture de recherche:**
```
Requête utilisateur
    ↓
Tokenisation (lowercase, séparation)
    ↓
Recherche dans article_indexes (JOIN)
    ↓
Récupération des articles correspondants
    ↓
Réponse paginée
```

## Structure

```
src/
├── application/     # Use Cases, DTOs
├── domain/         # Entités métier
├── infrastructure/ # Adapters (DB, Scraper)
└── presentation/   # Controllers REST
```

## Technologies

- NestJS 11
- Sequelize ORM
- MySQL 8.0
- TypeScript
- Swagger/OpenAPI
- Jest

## Performance

### Optimisations 

1. **Indexation optimisée**
   - Index inversé sur la table `article_indexes`
   - Tokenisation automatique des titres lors du scraping
   - Recherche plein texte performante

3. **Index de couverture (Covering Index)**
   - Index composite : `idx_title_fragment_article_id`
   - Permet l'Index-Only Scan
   - Réduction des I/O disque

### Index Stratégiques

**Table `articles`:**
- `idx_articles_source_id` : filtrage par source
- `idx_articles_created_at` : tri chronologique
- `idx_articles_publication_date_source_id` : filtrage combiné
- `idx_articles_source_id_publication_date` : autre combinaison fréquente

**Table `article_indexes`:**
- `idx_title_fragment_created_at` : recherche avec tri temporel
- `idx_title_fragment_article_id` : covering index (Index-Only Scan)

**Stratégie d'index:**
- Noms explicites pour éviter les duplications lors du `sync: { alter: true }`
- Covering index pour éviter l'accès aux tables
- Index composés pour requêtes complexes

## Auteur

Dongwoo VALLA-SHIN
