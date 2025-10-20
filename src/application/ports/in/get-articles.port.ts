/**
 * @author Dongwoo
 * @date 2025-10-13
 * Interface de cas d'utilisation de la consultation d'articles - Port entrant
 */
import {ArticleDomain} from '../../../domain/entities/article.domain';

/**
 * Requête de consultation d'article DTO
 */
export interface GetArticlesQuery {
  page?: number;
  pageSize?: number;
  sourceId?: string;
  publishedAfter?: Date;
  publishedBefore?: Date;
  title?: string;
  sortField?: 'publicationDate' | 'createdAt' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Résultats de la recherche d'articles
 */
export interface GetArticlesResult {
  articles: ArticleDomain[];
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Interface du cas d'utilisation de la consultation d'articles
 */
export interface GetArticlesPort {
  /**
   * Affichage des articles par pagination et application de filtres
   * @param query Requêtes de recherche
   * @returns Liste des articles paginés
   */
  execute(query: GetArticlesQuery): Promise<GetArticlesResult>;
}
