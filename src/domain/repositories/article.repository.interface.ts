/**
 * @author Dongwoo
 * @date 2025-10-13
 * Article 리포지토리 인터페이스 - 도메인 계층에서 정의하는 영속성 계약
 */
import {ArticleDomain} from '../entities/article.domain';
import {Transaction} from 'sequelize';

/**
 * 정렬 순서
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * 정렬 필드
 */
export type SortField = 'publicationDate' | 'createdAt' | 'viewCount' | 'title';

/**
 * 기사 조회 필터 옵션
 */
export interface ArticleFilterOptions {
  /** 소스 ID 필터 */
  sourceId?: string;

  /** 발행일 이후 (이 날짜 포함) */
  publishedAfter?: Date;

  /** 발행일 이전 (이 날짜 포함) */
  publishedBefore?: Date;

  /** 키워드 검색 */
  title?: string;

  /** 최근 일수 (현재로부터 며칠 이내의 기사) */
  recentDays?: number;

  /** 정렬 필드 */
  sortField?: SortField;

  /** 정렬 순서 */
  sortOrder?: SortOrder;

  /** 조회 개수 제한 */
  limit?: number;

  /** 오프셋 (페이지네이션) */
  offset?: number;
}

/**
 * 페이지네이션 결과
 */
export interface PaginatedArticles {
  items: ArticleDomain[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 트랜잭션 옵션
 */
export interface TransactionOptions {
  /** Sequelize 트랜잭션 인스턴스 */
  transaction?: Transaction;
}

/**
 * Article 리포지토리 인터페이스
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
