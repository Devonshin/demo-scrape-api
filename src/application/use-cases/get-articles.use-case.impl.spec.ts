/**
 * @author Devonshin
 * @date 2025-01-24
 * GetArticlesUseCaseImpl 단위 테스트
 * - Use Case 계층의 비즈니스 로직 테스트
 */

import {Test, TestingModule} from '@nestjs/testing';
import {GetArticlesUseCaseImpl} from './get-articles.use-case.impl';
import {IArticleRepository, PaginatedArticles} from '../../domain/repositories/article.repository.interface';
import {GetArticlesQuery} from '../ports/in/get-articles.use-case';
import {ArticleDomain} from '../../domain/entities/article.domain';
import {v4 as uuidv4} from 'uuid';

describe('GetArticlesUseCaseImpl', () => {
  let useCase: GetArticlesUseCaseImpl;
  let mockArticleRepository: jest.Mocked<IArticleRepository>;

  // 테스트용 샘플 데이터
  const mockArticles = [
    new ArticleDomain(
      uuidv4(),
      uuidv4(),
      'Test Article 1',
      'https://example.com/article-1',
      new Date('2025-01-20'),
      new Date(),
    ),
    new ArticleDomain(
      uuidv4(),
      uuidv4(),
      'Test Article 2',
      'https://example.com/article-2',
      new Date('2025-01-21'),
      new Date(),
    ),
  ];

  const mockPaginatedResult: PaginatedArticles = {
    items: mockArticles,
    page: 1,
    pageSize: 20,
    total: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    // Mock Article Repository 생성
    mockArticleRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUrl: jest.fn(),
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      findByKeyword: jest.fn(),
      bulkSave: jest.fn(),
      count: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetArticlesUseCaseImpl,
        {
          provide: 'IArticleRepository',
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetArticlesUseCaseImpl>(GetArticlesUseCaseImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('기본 쿼리로 기사를 조회해야 한다', async () => {
      // Given: 빈 쿼리 (기본값 사용)
      const query: GetArticlesQuery = {};
      mockArticleRepository.findPaginated.mockResolvedValue(mockPaginatedResult);

      // When: execute 호출
      const result = await useCase.execute(query);

      // Then: Repository가 올바른 파라미터로 호출되어야 함
      expect(mockArticleRepository.findPaginated).toHaveBeenCalledWith(
        1, // 기본 페이지
        20, // 기본 페이지 크기
        expect.objectContaining({
          sortField: 'publicationDate',
          sortOrder: 'DESC',
        }),
      );

      // Then: 결과가 올바르게 반환되어야 함
      expect(result.articles).toEqual(mockArticles);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);
    });

    it('커스텀 페이지 번호와 크기로 조회해야 한다', async () => {
      // Given: 커스텀 페이지 설정
      const query: GetArticlesQuery = {
        page: 2,
        pageSize: 10,
      };
      const customPaginatedResult: PaginatedArticles = {
        items: mockArticles,
        page: 2,
        pageSize: 10,
        total: 30,
        totalPages: 3,
      };
      mockArticleRepository.findPaginated.mockResolvedValue(customPaginatedResult);

      // When: execute 호출
      const result = await useCase.execute(query);

      // Then: 올바른 페이지 정보로 호출되어야 함
      expect(mockArticleRepository.findPaginated).toHaveBeenCalledWith(
        2,
        10,
        expect.any(Object),
      );

      // Then: 페이지네이션 정보가 올바르게 계산되어야 함
      expect(result.currentPage).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.hasNext).toBe(true); // 2페이지이고 총 3페이지이므로 다음 페이지 있음
      expect(result.hasPrevious).toBe(true); // 2페이지이므로 이전 페이지 있음
    });

    it('sourceId 필터를 적용해야 한다', async () => {
      // Given: sourceId가 포함된 쿼리
      const sourceId = uuidv4();
      const query: GetArticlesQuery = {
        sourceId,
      };
      mockArticleRepository.findPaginated.mockResolvedValue(mockPaginatedResult);

      // When: execute 호출
      const result = await useCase.execute(query);

      // Then: sourceId 필터가 전달되어야 함
      expect(mockArticleRepository.findPaginated).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({
          sourceId,
        }),
      );
    });

    it('title 필터를 적용해야 한다', async () => {
      // Given: title이 포함된 쿼리
      const query: GetArticlesQuery = {
        title: 'Test',
      };
      mockArticleRepository.findPaginated.mockResolvedValue(mockPaginatedResult);

      // When: execute 호출
      const result = await useCase.execute(query);

      // Then: title 필터가 전달되어야 함
      expect(mockArticleRepository.findPaginated).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({
          title: 'test',
        }),
      );
    });

    it('날짜 범위 필터를 적용해야 한다', async () => {
      // Given: 날짜 범위가 포함된 쿼리
      const publishedAfter = new Date('2025-01-01');
      const publishedBefore = new Date('2025-01-31');
      const query: GetArticlesQuery = {
        publishedAfter,
        publishedBefore,
      };
      mockArticleRepository.findPaginated.mockResolvedValue(mockPaginatedResult);

      // When: execute 호출
      const result = await useCase.execute(query);

      // Then: 날짜 필터가 전달되어야 함
      expect(mockArticleRepository.findPaginated).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({
          publishedAfter,
          publishedBefore,
        }),
      );
    });

    it('정렬 옵션을 적용해야 한다', async () => {
      // Given: 정렬 옵션이 포함된 쿼리
      const query: GetArticlesQuery = {
        sortField: 'title',
        sortOrder: 'ASC',
      };
      mockArticleRepository.findPaginated.mockResolvedValue(mockPaginatedResult);

      // When: execute 호출
      const result = await useCase.execute(query);

      // Then: 정렬 옵션이 전달되어야 함
      expect(mockArticleRepository.findPaginated).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({
          sortField: 'title',
          sortOrder: 'ASC',
        }),
      );
    });

    it('결과가 없을 때 빈 배열을 반환해야 한다', async () => {
      // Given: 결과가 없는 경우
      const emptyResult: PaginatedArticles = {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      };
      mockArticleRepository.findPaginated.mockResolvedValue(emptyResult);
      const query: GetArticlesQuery = {};

      // When: execute 호출
      const result = await useCase.execute(query);

      // Then: 빈 결과가 반환되어야 함
      expect(result.articles).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);
    });

    it('복합 필터 조건을 모두 적용해야 한다', async () => {
      // Given: 여러 필터가 포함된 쿼리
      const sourceId = uuidv4();
      const query: GetArticlesQuery = {
        page: 2,
        pageSize: 15,
        sourceId,
        title: 'Important',
        publishedAfter: new Date('2025-01-01'),
        sortField: 'createdAt',
        sortOrder: 'DESC',
      };
      mockArticleRepository.findPaginated.mockResolvedValue({
        items: mockArticles,
        page: 2,
        pageSize: 15,
        total: 25,
        totalPages: 2,
      });

      // When: execute 호출
      const result = await useCase.execute(query);

      // Then: 모든 필터가 전달되어야 함
      expect(mockArticleRepository.findPaginated).toHaveBeenCalledWith(
        2,
        15,
        expect.objectContaining({
          sourceId,
          title: 'important',
          publishedAfter: expect.any(Date),
          sortField: 'createdAt',
          sortOrder: 'DESC',
        }),
      );
    });

    it('Repository에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      // Given: Repository에서 에러 발생
      const errorMessage = 'Database connection error';
      mockArticleRepository.findPaginated.mockRejectedValue(
        new Error(errorMessage),
      );
      const query: GetArticlesQuery = {};

      // When & Then: 에러가 전파되어야 함
      await expect(useCase.execute(query)).rejects.toThrow(errorMessage);
    });
  });

  describe('calculateRecentDays (private method 간접 테스트)', () => {
    it('publishedAfter만 있을 때 recentDays를 계산해야 한다', async () => {
      // Given: publishedAfter만 설정 (7일 전)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const query: GetArticlesQuery = {
        publishedAfter: sevenDaysAgo,
      };
      mockArticleRepository.findPaginated.mockResolvedValue(mockPaginatedResult);

      // When: execute 호출
      await useCase.execute(query);

      // Then: recentDays가 계산되어 전달되어야 함
      expect(mockArticleRepository.findPaginated).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({
          recentDays: expect.any(Number),
        }),
      );
    });

    it('publishedBefore가 있으면 recentDays를 계산하지 않아야 한다', async () => {
      // Given: publishedAfter와 publishedBefore 모두 설정
      const query: GetArticlesQuery = {
        publishedAfter: new Date('2025-01-01'),
        publishedBefore: new Date('2025-01-31'),
      };
      mockArticleRepository.findPaginated.mockResolvedValue(mockPaginatedResult);

      // When: execute 호출
      await useCase.execute(query);

      // Then: recentDays가 undefined여야 함
      expect(mockArticleRepository.findPaginated).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({
          recentDays: undefined,
        }),
      );
    });
  });
});
