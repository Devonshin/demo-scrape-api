/**
 * @author Devonshin
 * @date 2025-10-13
 * ArticleController 테스트
 */
import {Test, TestingModule} from '@nestjs/testing';
import {ArticleController} from '../article.controller';
import {IScrapeArticlesUseCase} from '../../../application/ports/in/scrape-articles.use-case';
import {IGetArticlesUseCase} from '../../../application/ports/in/get-articles.use-case';
import {ScrapeRequestDto} from '../../../application/dto/scrape-request.dto';
import {GetArticlesQueryDto} from '../../../application/dto/get-articles-query.dto';
import {v4 as uuidv4} from 'uuid';
import {ArticleDomain} from '../../../domain/entities/article.domain';
import {bufferToUuid} from "../../../common/utils/uuid.util";

describe('ArticleController', () => {
  let controller: ArticleController;
  let scrapeArticlesUseCase: jest.Mocked<IScrapeArticlesUseCase>;
  let getArticlesUseCase: jest.Mocked<IGetArticlesUseCase>;
  const bbcNewsSourceId = bufferToUuid(Buffer.from('72BDC8C6CD434E41BD7912A13E16C8B7', 'hex'))!;
  const mockArticle = new ArticleDomain(
    uuidv4(),
    bbcNewsSourceId,
    'Test Article',
    'https://example.com/test-article',
    'summary data',
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockScrapeArticlesUseCase = {
      execute: jest.fn(),
    };
    const mockGetArticlesUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: 'IScrapeArticlesUseCase',
          useValue: mockScrapeArticlesUseCase,
        },
        {
          provide: 'IGetArticlesUseCase',
          useValue: mockGetArticlesUseCase,
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    scrapeArticlesUseCase = module.get('IScrapeArticlesUseCase');
    getArticlesUseCase = module.get('IGetArticlesUseCase');
  });

  describe('getArticles', () => {
    it('should return articles with pagination', async () => {
      const query: GetArticlesQueryDto = {
        page: 1,
        pageSize: 10,
      };
      const mockUseCaseResponse = {
        articles: [mockArticle],
        total: 1,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      getArticlesUseCase.execute.mockResolvedValue(mockUseCaseResponse);

      const result = await controller.getArticles(query);

      expect(getArticlesUseCase.execute).toHaveBeenCalledWith(query);
      expect(result.articles).toHaveLength(1);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(1);
    });

    it('should apply filters to get articles', async () => {
      const query: GetArticlesQueryDto = {
        page: 1,
        pageSize: 10,
        sourceId: bbcNewsSourceId,
        title: 'test',
        publishedAfter: new Date('2025-01-01'),
        publishedBefore: new Date('2025-12-31'),
        sortField: 'publicationDate',
        sortOrder: 'DESC',
      };
      const mockUseCaseResponse = {
        articles: [mockArticle],
        total: 1,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      getArticlesUseCase.execute.mockResolvedValue(mockUseCaseResponse);

      const result = await controller.getArticles(query);

      expect(getArticlesUseCase.execute).toHaveBeenCalledWith(query);
      expect(result.articles).toHaveLength(1);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.currentPage).toBe(1);
    });
  });

  describe('scrape', () => {
    it('should execute scraping successfully', async () => {
      const request: ScrapeRequestDto = {
        sourceId: bbcNewsSourceId, //BBC news
        uri: '/news',
      };
      const mockUseCaseResponse = {
        totalSourcesScraped: 1,
        successfulSources: 1,
        failedSources: 0,
        totalArticlesScraped: 10,
        duplicateArticles: 0,
        errors: [],
      };
      scrapeArticlesUseCase.execute.mockResolvedValue(mockUseCaseResponse);

      const result = await controller.scrape(request);

      expect(scrapeArticlesUseCase.execute).toHaveBeenCalledWith(request);
      expect(result.success).toBe(true);
      expect(result.totalSourcesScraped).toBe(1);
      expect(result.totalArticlesScraped).toBe(10);
      expect(result.startedAt).toBeDefined();
      expect(result.completedAt).toBeDefined();
      expect(result.durationSeconds).toBeGreaterThanOrEqual(0);
    });

    it('should handle scraping errors', async () => {
      const request: ScrapeRequestDto = {
        sourceId: bbcNewsSourceId, //BBC news
      };
      const mockError = new Error('Scraping failed');
      scrapeArticlesUseCase.execute.mockRejectedValue(mockError);

      await expect(controller.scrape(request)).rejects.toThrow(mockError);
    });

    it('should handle partial scraping failures', async () => {
      const request: ScrapeRequestDto = {
        sourceId: bbcNewsSourceId, //BBC news
      };
      const mockUseCaseResponse = {
        totalSourcesScraped: 2,
        successfulSources: 1,
        failedSources: 1,
        totalArticlesScraped: 5,
        duplicateArticles: 0,
        errors: [{
          sourceId: uuidv4(),
          error: 'Source not found',
        }],
      };
      scrapeArticlesUseCase.execute.mockResolvedValue(mockUseCaseResponse);

      const result = await controller.scrape(request);

      expect(result.success).toBe(false);
      expect(result.totalSourcesScraped).toBe(2);
      expect(result.successfulSources).toBe(1);
      expect(result.failedSources).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });
});
