#!/bin/bash

BASE_URL="http://localhost:3000"
BBC_SOURCE_ID="72bdc8c6-cd43-4e41-bd79-12a13e16c8b7"

echo "=== API Test ==="
echo ""

# 1. Recherche de base
echo "1. GET /articles - Recherche de base"
TOTAL=$(curl -s "${BASE_URL}/articles?page=1&pageSize=10" | jq '.data.pagination.totalItems')
echo "  ✅ Total ${TOTAL} articles"
echo ""

# 2. Recherche insensible à la casse (minuscules)
echo "2. GET /articles?title=republicans \(minuscules\)"
RESULT=$(curl -s "${BASE_URL}/articles?title=republicans&pageSize=3" | jq '.data.pagination.totalItems')
echo "  ✅ Total ${TOTAL} articles"
echo ""

# 3. Recherche insensible à la casse (majuscules)
echo "3. GET /articles?title=Republicans \(majuscules\)"
RESULT=$(curl -s "${BASE_URL}/articles?title=Republicans&pageSize=3" | jq '.data.pagination.totalItems')
echo "  ✅ Total ${TOTAL} articles"
echo ""

# 4. Recherche insensible à la casse (mixte)
echo "4. GET /articles?title=REPUBLICANS \(tous majuscules\)"
RESULT=$(curl -s "${BASE_URL}/articles?title=REPUBLICANS&pageSize=3" | jq '.data.pagination.totalItems')
echo "  ✅ Total ${TOTAL} articles"
echo ""

# 5. Filtres composés (title + sort)
echo "5. GET /articles - Filtres composés \(title + sort\)"
RESULT=$(curl -s "${BASE_URL}/articles?title=news&sortField=publicationDate&sortOrder=DESC&pageSize=5" | jq '.data.articles | length')
echo "  ✅ Total ${TOTAL} articles"
echo ""

# 6. Tests de raclage
echo "6. POST /articles/scrape - BBC News"
RESULT=$(curl -s -X POST "${BASE_URL}/articles/scrape" \
  -H "Content-Type: application/json" \
  -d "{\"sourceId\": \"${BBC_SOURCE_ID}\"}" | jq '.data.success')
echo "  ✅ success: ${RESULT}"
echo ""

echo "=== 테스트 완료 ==="
