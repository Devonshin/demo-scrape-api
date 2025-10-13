/**
 * @author Dongwoo
 * @date 2025-10-13
 * Article Repository 구현 - IArticleRepository 구현체
 */
import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {Op, Sequelize} from 'sequelize';
import {
  ArticleFilterOptions,
  IArticleRepository,
  PaginatedArticles,
  TransactionOptions,
} from '../../../domain/repositories/article.repository.interface';
import {ArticleDomain} from '../../../domain/entities/article.domain';
import {Article, ArticleIndex} from '../../../entities';
import {ArticleMapper} from './mappers/article.mapper';

/**
 * Article Repository 구현
 * Sequelize를 사용한 영속성 계층 구현
 */
@Injectable()
export class ArticleRepositoryImpl implements IArticleRepository {

  private readonly logger = new Logger(ArticleRepositoryImpl.name);

  constructor(
    @InjectModel(Article)
    private readonly articleModel: typeof Article,
    @InjectModel(ArticleIndex)
    private readonly articleIndexModel: typeof ArticleIndex,
  ) {}

  /**
   * 기사 저장 (생성 또는 업데이트)
   * @param article 저장할 기사 도메인 엔티티
   * @param options 트랜잭션 옵션
   * @returns 저장된 기사
   */
  async save(article: ArticleDomain, options?: TransactionOptions): Promise<ArticleDomain> {
    try {
      const data = ArticleMapper.toPersistence(article);

      // upsert를 사용하여 생성 또는 업데이트
      const [instance, created] = await this.articleModel.upsert(data as any, {
        transaction: options?.transaction,
      });

      // 키워드 인덱스 생성 (신규 생성 시에만)
      if (created) {
        await this.createArticleIndexes(article.id, article.title, options);
      }

      this.logger.log(`Article ${created ? 'created' : 'updated'}: ${instance.id}`);

      return ArticleMapper.toDomain(instance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to save article: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 기사 ID로 조회
   * @param id 기사 ID
   * @param options 트랜잭션 옵션
   * @returns 조회된 기사 또는 null
   */
  async findById(id: string, options?: TransactionOptions): Promise<ArticleDomain | null> {
    const article = await this.articleModel.findByPk(id, {
      transaction: options?.transaction,
    });
    return article ? ArticleMapper.toDomain(article) : null;
  }

  /**
   * URL로 기사 조회 (중복 체크용)
   * @param sourceId
   * @param url 기사 URL
   * @param options 트랜잭션 옵션
   * @returns 조회된 기사 또는 null
   */
  async findByUrl(sourceId: string, url: string, options?: TransactionOptions): Promise<ArticleDomain | null> {
    const article = await this.articleModel.findOne({
      where: { sourceId: sourceId, url: url },
      transaction: options?.transaction,
    });
    return article ? ArticleMapper.toDomain(article) : null;
  }

  /**
   * 필터 조건에 따라 기사 목록 조회
   * @param filterOptions 필터 옵션
   * @param txOptions 트랜잭션 옵션
   * @returns 기사 목록
   */
  async findAll(filterOptions?: ArticleFilterOptions, txOptions?: TransactionOptions): Promise<ArticleDomain[]> {
    const where = this.buildWhereClause(filterOptions);
    const order = this.buildOrderClause(filterOptions);

    const articles = await this.articleModel.findAll({
      where,
      limit: filterOptions?.limit,
      offset: filterOptions?.offset,
      order,
      transaction: txOptions?.transaction,
    });

    return ArticleMapper.toDomainList(articles);
  }

  /**
   * 페이지네이션과 필터를 적용한 기사 조회
   * @param page 페이지 번호 (1부터 시작)
   * @param pageSize 페이지 크기
   * @param filterOptions 필터 옵션
   * @param txOptions 트랜잭션 옵션
   * @returns 페이지네이션된 기사 목록
   */
  async findPaginated(
    page: number,
    pageSize: number,
    filterOptions?: ArticleFilterOptions,
    txOptions?: TransactionOptions,
  ): Promise<PaginatedArticles> {
    const where = this.buildWhereClause(filterOptions);
    const order = this.buildOrderClause(filterOptions);
    const offset = (page - 1) * pageSize;

    // keyword가 있는 경우 article_indexes를 활용한 제목 전문검색
    if (filterOptions?.title) {
      // 키워드를 단어로 분리
      const keywords = filterOptions.title
        .split(/[\s\,\.\!\?\-\(\)\[\]\{\}]+/)
        .filter((word) => word.length > 1)
        .map((word) => word.substring(0, 50));

      if (keywords.length > 0) {
        // ArticleIndex를 사용하여 기사 ID 조회
        const indexes = await this.articleIndexModel.findAll({
          where: {
            titleFragment: {
              [Op.in]: keywords,
            },
          },
          attributes: ['articleId'],
          group: ['articleId'],
          // 모든 키워드가 포함된 기사만 조회
          having: Sequelize.literal(`COUNT(DISTINCT title_fragment) = ${keywords.length}`),
          transaction: txOptions?.transaction,
        });

        const articleIds = indexes.map((index) => index.articleId);

        if (articleIds.length === 0) {
          // 검색 결과가 없는 경우
          return {
            items: [],
            total: 0,
            page,
            pageSize,
            totalPages: 0,
          };
        }

        // 검색된 ID로 WHERE 조건 추가
        where.id = { [Op.in]: articleIds };
      }
    }

    const { rows, count } = await this.articleModel.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order,
      transaction: txOptions?.transaction,
    });

    const items = ArticleMapper.toDomainList(rows);
    const totalPages = Math.ceil(count / pageSize);

    return {
      items,
      total: count,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * 대량 기사 저장 (성능 최적화)
   * @param articles 저장할 기사 목록
   * @param options 트랜잭션 옵션
   * @returns 저장된 기사 목록
   */
  async saveBulk(articles: ArticleDomain[], options?: TransactionOptions): Promise<ArticleDomain[]> {
    try {
      if (articles.length === 0) {
        return [];
      }

      // 도메인 엔티티를 영속성 데이터로 변환
      const data = articles.map((article) => ArticleMapper.toPersistence(article));

      // bulkCreate로 대량 삽입 (중복시 무시)
      const instances = await this.articleModel.bulkCreate(data as any[], {
        ignoreDuplicates: true,
        transaction: options?.transaction,
      });

      this.logger.log(`Bulk created ${instances.length} articles`);

      // 생성된 기사들에 대한 인덱스 생성
      for (const article of articles) {
        await this.createArticleIndexes(article.id, article.title, options);
      }

      // 도메인 엔티티로 변환하여 반환
      return ArticleMapper.toDomainList(instances);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to bulk create articles: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 소스 ID로 기사 수 조회
   * @param sourceId 소스 ID
   * @param options 트랜잭션 옵션
   * @returns 기사 수
   */
  async countBySourceId(sourceId: string, options?: TransactionOptions): Promise<number> {
    return await this.articleModel.count({
      where: { sourceId },
      transaction: options?.transaction,
    });
  }

  /**
   * 필터 옵션으로 WHERE 절 구성
   * @param options 필터 옵션
   * @returns WHERE 절 객체
   */
  private buildWhereClause(options?: ArticleFilterOptions): any {
    const where: any = {};

    // 소스 ID 필터
    if (options?.sourceId) {
      where.sourceId = options.sourceId;
    }

    // 최근 N일 내 기사 (publishedAfter보다 우선)
    if (options?.recentDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - options.recentDays);
      where.publicationDate = { [Op.gte]: daysAgo };
    } else {
      // 발행일 이후
      if (options?.publishedAfter) {
        where.publicationDate = { [Op.gte]: options.publishedAfter };
      }

      // 발행일 이전
      if (options?.publishedBefore) {
        where.publicationDate = {
          ...where.publicationDate,
          [Op.lte]: options.publishedBefore,
        };
      }
    }

    // 제목 검색 (LIKE 검색)
    if (options?.titleSearch) {
      where.title = { [Op.like]: `%${options.titleSearch}%` };
    }

    return where;
  }

  /**
   * 정렬 옵션으로 ORDER BY 절 구성
   * @param options 필터 옵션
   * @returns ORDER BY 절 배열
   */
  private buildOrderClause(options?: ArticleFilterOptions): [string, string][] {
    const sortField = options?.sortField || 'publicationDate';
    const sortOrder = options?.sortOrder || 'DESC';

    // Sequelize에서 사용하는 커럼 명으로 변환 (camelCase → snake_case)
    const columnMap: Record<string, string> = {
      publicationDate: 'publication_date',
      createdAt: 'created_at',
      title: 'title',
    };

    const column = columnMap[sortField] || 'publication_date';
    return [[column, sortOrder]];
  }

  /**
   * 기사 제목 키워드 인덱스 생성
   * @param articleId 기사 ID
   * @param title 기사 제목
   * @param options 트랜잭션 옵션
   */
  private async createArticleIndexes(articleId: string, title: string, options?: TransactionOptions): Promise<void> {
    try {
      // 제목을 단어로 분리
      const words = title
        .split(/[\s\,\.\!\?\-\(\)\[\]\{\}]+/)
        .filter((word) => word.length > 1)
        .map((word) => word.substring(0, 50));

      // 중복 제거
      const uniqueWords = [...new Set(words)];

      // bulkCreate로 대량 삽입
      if (uniqueWords.length > 0) {
        await this.articleIndexModel.bulkCreate(
          uniqueWords.map((word) => ({
            articleId,
            titleFragment: word,
          })),
          {
            transaction: options?.transaction,
          },
        );

        this.logger.log(`Created ${uniqueWords.length} indexes for article ${articleId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create article indexes: ${errorMessage}`);
      throw error;
    }
  }
}
