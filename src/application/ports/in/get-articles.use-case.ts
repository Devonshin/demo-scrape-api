/**
 * @author Dongwoo
 * @date 2025-10-13
 * 기사 조회 Use Case 인터페이스 - 인바운드 포트
 */
import {ArticleDomain} from '../../../domain/entities/article.domain';

/**
 * 기사 조회 쿼리 DTO
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
 * 기사 조회 결과
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
 * 기사 조회 Use Case 인터페이스
 * 애플리케이션 계층의 진입점
 */
export interface IGetArticlesUseCase {
  /**
   * 페이지네이션과 필터를 적용하여 기사 조회
   * @param query 조회 쿼리
   * @returns 페이지네이션된 기사 목록
   */
  execute(query: GetArticlesQuery): Promise<GetArticlesResult>;
}
