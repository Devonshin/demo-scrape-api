/**
 * @author Dongwoo
 * @date 2025-10-13
 * 기사 조회 Use Case 구현체
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IGetArticlesUseCase,
  GetArticlesQuery,
  GetArticlesResult,
} from '../ports/in/get-articles.use-case';
import { IArticleRepository, ArticleFilterOptions } from '../../domain/repositories/article.repository.interface';

/**
 * 기사 조회 Use Case 구현
 * 페이지네이션, 필터링, 정렬 기능 제공
 */
@Injectable()
export class GetArticlesUseCaseImpl implements IGetArticlesUseCase {
  private readonly logger = new Logger(GetArticlesUseCaseImpl.name);

  constructor(
    @Inject('IArticleRepository')
    private readonly articleRepository: IArticleRepository,
  ) {}

  /**
   * 페이지네이션과 필터를 적용하여 기사 조회
   * @param query 조회 쿼리
   * @returns 페이지네이션된 기사 목록
   */
  async execute(query: GetArticlesQuery): Promise<GetArticlesResult> {
    this.logger.log('Get articles query', query);

    // 페이지 번호와 페이지 크기 설정
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    // 필터 옵션 구성
    const filterOptions: ArticleFilterOptions = {
      sourceId: query.sourceId,
      title: query.title,
      sortField: query.sortField || 'publicationDate',
      sortOrder: query.sortOrder || 'DESC',
    };

    // 날짜 범위 설정
    if (query.publishedAfter) {
      filterOptions.publishedAfter = query.publishedAfter;
    }
    if (query.publishedBefore) {
      filterOptions.publishedBefore = query.publishedBefore;
    }

    // Repository를 통해 조회
    const result = await this.articleRepository.findPaginated(
      page,
      pageSize,
      filterOptions,
    );

    this.logger.log(`Found ${result.total} articles (page ${page}/${result.totalPages})`);

    // Repository 응답을 Use Case 응답 형식으로 변환
    return {
      articles: result.items,
      currentPage: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrevious: result.page > 1,
    };
  }

}
