# Font Ninja - Service de Scraping d'Articles

API REST pour le scraping et la gestion d'articles de presse.

## Prérequis
- Node.js 18+
- Docker & Docker Compose

## Installation

### Option 1: Installation avec Docker (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f app-dev
```

L'application démarre sur `http://localhost:3000`

**Commandes utiles:**
```bash
# Redémarrer l'application
docker-compose restart app-dev

# Accéder au shell du conteneur
docker-compose exec app-dev sh

# Accéder à MySQL
docker-compose exec mysql mysql -u font_ninja -pfontninja@password font_ninja_scrapping_db
```

### Option 2: Installation Manuelle

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.local .env

# 3. Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE font_ninja_scrapping_db;
CREATE USER 'font_ninja'@'localhost' IDENTIFIED BY 'fontninja@password';
GRANT ALL PRIVILEGES ON font_ninja_scrapping_db.* TO 'font_ninja'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 4. Exécuter les migrations
npm run migration:run

# 5. Démarrer l'application
npm run start:local
```

## Configuration

Fichier `.env`:
```env
NODE_ENV=local
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=font_ninja
DB_PASSWORD=fontninja@password
DB_DATABASE=font_ninja_scrapping_db
```

## Tests

```bash
# Avec Docker
docker-compose exec app-dev npm test

# Avec couverture
docker-compose exec app-dev npm run test:cov

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
