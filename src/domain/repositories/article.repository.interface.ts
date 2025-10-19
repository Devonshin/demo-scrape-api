/**
 * @author Dongwoo
 * @date 2025-10-13
 * Interface du référentiel d'articles - Accords de permanence définis par la hiérarchie des domaines
 */
import {ArticleDomain} from '../entities/article.domain';
import {Transaction} from 'sequelize';

/**
 * Ordre de tri
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * Trier les champs
 */
export type SortField = 'publicationDate' | 'createdAt' | 'viewCount' | 'title';

/**
 * Options de filtrage de l'affichage des articles
 */
export interface ArticleFilterOptions {
  /** Filtre d'identification de la source */
  sourceId?: string;

  /** Après la date de publication (y compris cette date) */
  publishedAfter?: Date;

  /** Avant la date de publication (y compris cette date) */
  publishedBefore?: Date;

  /** Recherche par titre */
  title?: string;

  /** Récence (articles parus dans les quelques jours précédant la journée en cours) */
  recentDays?: number;

  /** champs de tri */
  sortField?: SortField;

  /** ordre de tri */
  sortOrder?: SortOrder;

  /** limite (pagination) */
  limit?: number;

  /** Décalage (pagination) */
  offset?: number;
}

/**
 * Résultats de la pagination
 */
export interface PaginatedArticles {
  items: ArticleDomain[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Options de transaction
 */
export interface TransactionOptions {
  transaction?: Transaction;
}

/**
 * Interface de dépôt d'articles
 * 인프라스트럭처 계층에서 구현해야 하는 계약
 */
export interface IArticleRepository {
  /**
   * 기사 저장 (생성 또는 업데이트)
   * @param article 저장할 기사 도메인 엔티티
   * @param options 트랜잭션 옵션
   * @returns 저장된 기사
   */
  save(article: ArticleDomain, options?: TransactionOptions): Promise<ArticleDomain>;

  /**
   * 기사 ID로 조회
   * @param id 기사 ID
   * @param options 트랜잭션 옵션
   * @returns 조회된 기사 또는 null
   */
  findById(id: string, options?: TransactionOptions): Promise<ArticleDomain | null>;

  /**
   * URL로 기사 조회 (중복 체크용)
   * @param sourceId source id
   * @param url 기사 URL
   * @param options 트랜잭션 옵션
   * @returns 조회된 기사 또는 null
   */
  findByUrl(sourceId: string, url: string, options?: TransactionOptions): Promise<ArticleDomain | null>;

  /**
   * 필터 조건에 따라 기사 목록 조회
   * @param filterOptions 필터 옵션
   * @param txOptions 트랜잭션 옵션
   * @returns 기사 목록
   */
  findAll(filterOptions?: ArticleFilterOptions, txOptions?: TransactionOptions): Promise<ArticleDomain[]>;

  /**
   * 페이지네이션과 필터를 적용한 기사 조회
   * @param page 페이지 번호 (1부터 시작)
   * @param pageSize 페이지 크기
   * @param filterOptions 필터 옵션
   * @param txOptions 트랜잭션 옵션
   * @returns 페이지네이션된 기사 목록
   */
  findPaginated(
    page: number,
    pageSize: number,
    filterOptions?: ArticleFilterOptions,
    txOptions?: TransactionOptions,
  ): Promise<PaginatedArticles>;

  /**
   * 대량 기사 저장 (성능 최적화)
   * @param articles 저장할 기사 목록
   * @param options 트랜잭션 옵션
   * @returns 저장된 기사 목록
   */
  saveBulk(articles: ArticleDomain[], options?: TransactionOptions): Promise<ArticleDomain[]>;

  /**
   * 소스 ID로 기사 수 조회
   * @param sourceId 소스 ID
   * @param options 트랜잭션 옵션
   * @returns 기사 수
   */
  countBySourceId(sourceId: string, options?: TransactionOptions): Promise<number>;

}
