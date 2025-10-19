/**
 * @author Devonshin
 * @date 2025-01-13
 * ArticleRepositoryImpl Tests unitaires
 * - Tester les capacités CRUD et de recherche du niveau Référentiel
 */
import {Test, TestingModule} from '@nestjs/testing';
import {getModelToken} from '@nestjs/sequelize';
import {ArticleRepositoryImpl} from '../article.repository.impl';
import {Article, ArticleIndex} from '../../../../entities/entity.module';
import {ArticleDomain} from '../../../../domain/entities/article.domain';
import {v4 as uuidv4} from 'uuid';

describe('ArticleRepositoryImpl', () => {
  let repository: ArticleRepositoryImpl;
  let articleModel: jest.Mocked<typeof Article>;
  let articleIndexModel: jest.Mocked<typeof ArticleIndex>;

  // Échantillon de données de domaine à des fins de test
  const mockArticleDomain = new ArticleDomain(
    uuidv4(),
    uuidv4(),
    'Test Article Title',
    'https://example.com/test-article',
    'summary data',
    new Date('2025-01-13'),
    new Date(),
  );

  // Échantillon de données d'entités à des fins de test
  const mockArticleEntity = {
    id: mockArticleDomain.id,
    sourceId: mockArticleDomain.sourceId,
    title: mockArticleDomain.title,
    url: mockArticleDomain.url,
    publicationDate: mockArticleDomain.publicationDate,
    createdAt: mockArticleDomain.createdAt,
    get: jest.fn((key: string) => {
      const data: any = {
        id: mockArticleDomain.id,
        sourceId: mockArticleDomain.sourceId,
        title: mockArticleDomain.title,
        url: mockArticleDomain.url,
        publicationDate: mockArticleDomain.publicationDate,
        createdAt: mockArticleDomain.createdAt,
      };
      return data[key];
    }),
    toJSON: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    // Créer un modèle d'article fictif
    const mockArticleModel = {
      upsert: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      bulkCreate: jest.fn(),
      count: jest.fn(),
    };

    // ArticleIndex 모델 목(Mock) 생성
    const mockArticleIndexModel = {
      findAll: jest.fn(),
      bulkCreate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleRepositoryImpl,
        {
          provide: getModelToken(Article),
          useValue: mockArticleModel,
        },
        {
          provide: getModelToken(ArticleIndex),
          useValue: mockArticleIndexModel,
        },
      ],
    }).compile();

    repository = module.get<ArticleRepositoryImpl>(ArticleRepositoryImpl);
    articleModel = module.get(getModelToken(Article));
    articleIndexModel = module.get(getModelToken(ArticleIndex));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('새 기사를 성공적으로 저장해야 한다', async () => {
      // Given: upsert가 새로운 레코드를 생성하는 경우
      articleModel.upsert.mockResolvedValue([mockArticleEntity, true] as any);
      articleIndexModel.bulkCreate.mockResolvedValue([]);

      // When: save 메서드 호출
      const result = await repository.save(mockArticleDomain);

      // Then: 정상적으로 저장되고 도메인 엔티티가 반환되어야 함
      expect(articleModel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockArticleDomain.id,
          sourceId: mockArticleDomain.sourceId,
          title: mockArticleDomain.title,
        }),
        expect.any(Object),
      );
      expect(result).toBeInstanceOf(ArticleDomain);
      expect(result.id).toBe(mockArticleDomain.id);
    });

    it('기존 기사를 업데이트해야 한다', async () => {
      // Given: upsert가 기존 레코드를 업데이트하는 경우
      articleModel.upsert.mockResolvedValue([mockArticleEntity, false] as any);

      // When: save 메서드 호출
      const result = await repository.save(mockArticleDomain);

      // Then: 업데이트가 성공해야 함
      expect(articleModel.upsert).toHaveBeenCalled();
      expect(result.id).toBe(mockArticleDomain.id);
    });

    it('저장 실패 시 에러를 던져야 한다', async () => {
      // Given: upsert가 실패하는 경우
      const errorMessage = 'Database error';
      articleModel.upsert.mockRejectedValue(new Error(errorMessage));

      // When & Then: 에러가 발생해야 함
      await expect(repository.save(mockArticleDomain)).rejects.toThrow(errorMessage);
    });
  });

  describe('findById', () => {
    it('ID로 기사를 찾아야 한다', async () => {
      // Given: findByPk가 레코드를 반환하는 경우
      articleModel.findByPk.mockResolvedValue(mockArticleEntity as any);

      // When: findById 호출
      const result = await repository.findById(mockArticleDomain.id);

      // Then: 기사가 반환되어야 함
      expect(articleModel.findByPk).toHaveBeenCalledWith(
        expect.any(Object), // Buffer 타입은 내부 구조만 검사
        expect.any(Object),
      );
      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockArticleDomain.id);
    });

    it('기사가 없으면 null을 반환해야 한다', async () => {
      // Given: findByPk가 null을 반환하는 경우
      articleModel.findByPk.mockResolvedValue(null);

      // When: findById 호출
      const result = await repository.findById('non-existent-id');

      // Then: null이 반환되어야 함
      expect(result).toBeNull();
    });
  });

  describe('findByUrl', () => {
    it('URL로 기사를 찾아야 한다', async () => {
      // Given: findOne이 레코드를 반환하는 경우
      articleModel.findOne.mockResolvedValue(mockArticleEntity as any);

      // When: findByUrl 호출
      const result = await repository.findByUrl(
        mockArticleDomain.sourceId,
        mockArticleDomain.url,
      );

      // Then: 기사가 반환되어야 함
      const actualWhere = {
        where: {
          sourceId: mockArticleDomain.sourceId,
          url: mockArticleDomain.url,
        },
        transaction: undefined,
      };
      expect(articleModel.findOne).toHaveBeenCalledWith({
        where: {
          sourceId: expect.any(Object),
          url: mockArticleDomain.url,
        },
        transaction: undefined,
      });
      expect(result).not.toBeNull();
      expect(result?.url).toBe(mockArticleDomain.url);
    });

    it('URL로 기사를 찾지 못하면 null을 반환해야 한다', async () => {
      // Given: findOne이 null을 반환하는 경우
      articleModel.findOne.mockResolvedValue(null);

      // When: findByUrl 호출
      const result = await repository.findByUrl('source-id', 'non-existent-url');

      // Then: null이 반환되어야 함
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('필터 없이 모든 기사를 조회해야 한다', async () => {
      // Given: findAll이 기사 목록을 반환하는 경우
      const mockArticles = [mockArticleEntity, { ...mockArticleEntity, id: uuidv4() }];
      articleModel.findAll.mockResolvedValue(mockArticles as any);

      // When: findAll 호출
      const result = await repository.findAll();

      // Then: 기사 목록이 반환되어야 함
      expect(articleModel.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ArticleDomain);
    });

    it('sourceId 필터로 기사를 조회해야 한다', async () => {
      // Given: findAll이 필터링된 결과를 반환하는 경우
      articleModel.findAll.mockResolvedValue([mockArticleEntity] as any);

      // When: sourceId 필터로 findAll 호출
      const result = await repository.findAll({
        sourceId: mockArticleDomain.sourceId,
      });

      // Then: 필터가 적용되어야 함
      const actualOptions = {
        where: { sourceId: mockArticleDomain.sourceId },
        order: [['publication_date', 'DESC']],
      };
      expect(articleModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sourceId: expect.any(Object) },
          order: [['publication_date', 'DESC']],
          transaction: undefined,
        })
      );
      expect(result).toHaveLength(1);
    });

    it('날짜 범위 필터로 기사를 조회해야 한다', async () => {
      // Given: 날짜 필터 설정
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      articleModel.findAll.mockResolvedValue([mockArticleEntity] as any);

      // When: 날짜 범위 필터로 findAll 호출
      await repository.findAll({
        publishedAfter: startDate,
        publishedBefore: endDate,
      });

      // Then: 날짜 필터가 적용되어야 함
      expect(articleModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            publicationDate: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('findPaginated', () => {
    it('페이지네이션이 적용된 기사 목록을 반환해야 한다', async () => {
      // Given: findAndCountAll이 페이지네이션된 결과를 반환하는 경우
      const mockResult = {
        rows: [mockArticleEntity, { ...mockArticleEntity, id: uuidv4() }],
        count: 10,
      };
      articleModel.findAndCountAll.mockResolvedValue(mockResult as any);

      // When: 2페이지, 페이지 크기 2로 조회
      const result = await repository.findPaginated(2, 2);

      // Then: 올바른 페이지네이션 정보가 반환되어야 함
      expect(articleModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 2,
          offset: 2, // (page-1) * pageSize = (2-1) * 2 = 2
        }),
      );
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(5); // Math.ceil(10/2)
    });

    it('키워드 검색 시 ArticleIndex를 JOIN으로 활용해야 한다', async () => {
      // Given: 키워드 검색을 위한 설정
      articleModel.findAndCountAll.mockResolvedValue({
        rows: [mockArticleEntity],
        count: 1,
      } as any);

      // When: title 필터로 검색
      const result = await repository.findPaginated(1, 10, {
        title: 'Test Article',
      });

      // Then: ArticleIndex와 JOIN하여 조회되어야 함
      expect(articleModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: articleIndexModel,
              as: 'indexes',
              where: expect.any(Object),
              required: true,
            }),
          ]),
        }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('키워드 검색 결과가 없으면 빈 결과를 반환해야 한다', async () => {
      // Given: ArticleIndex JOIN 결과가 없는 경우
      articleModel.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0,
      } as any);

      // When: title 필터로 검색
      const result = await repository.findPaginated(1, 10, {
        title: 'NonExistent',
      });

      // Then: 빈 결과가 반환되어야 함
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('saveBulk', () => {
    it('여러 기사를 대량으로 저장해야 한다', async () => {
      // Given: bulkCreate가 성공하는 경우
      const mockArticles = [
        mockArticleDomain,
        new ArticleDomain(
          uuidv4(),
          mockArticleDomain.sourceId,
          mockArticleDomain.title,
          mockArticleDomain.url,
          mockArticleDomain.summary,
          mockArticleDomain.publicationDate,
          mockArticleDomain.createdAt,
        ),
      ];
      const mockInstances = mockArticles.map((article) => ({
        ...article,
        get: jest.fn((key: string) => {
          const data: any = {
            id: article.id,
            sourceId: article.sourceId,
            title: article.title,
            url: article.url,
            publicationDate: article.publicationDate,
            createdAt: article.createdAt,
          };
          return data[key];
        }),
        toJSON: jest.fn().mockReturnThis(),
      }));
      articleModel.bulkCreate.mockResolvedValue(mockInstances as any);
      articleIndexModel.bulkCreate.mockResolvedValue([]);

      // When: saveBulk 호출
      const result = await repository.saveBulk(mockArticles);

      // Then: bulkCreate가 호출되어야 함
      expect(articleModel.bulkCreate).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          ignoreDuplicates: true,
        }),
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ArticleDomain);
    });

    it('빈 배열이 입력되면 빈 배열을 반환해야 한다', async () => {
      // When: 빈 배열로 saveBulk 호출
      const result = await repository.saveBulk([]);

      // Then: bulkCreate가 호출되지 않아야 함
      expect(articleModel.bulkCreate).not.toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it('대량 저장 실패 시 에러를 던져야 한다', async () => {
      // Given: bulkCreate가 실패하는 경우
      const errorMessage = 'Bulk create failed';
      articleModel.bulkCreate.mockRejectedValue(new Error(errorMessage));

      // When & Then: 에러가 발생해야 함
      await expect(repository.saveBulk([mockArticleDomain])).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('countBySourceId', () => {
    it('특정 소스의 기사 수를 반환해야 한다', async () => {
      // Given: count가 숫자를 반환하는 경우
      const expectedCount = 42;
      articleModel.count.mockResolvedValue(expectedCount);

      // When: countBySourceId 호출
      const result = await repository.countBySourceId(mockArticleDomain.sourceId);

      // Then: 올바른 카운트가 반환되어야 함
      const actualCountOptions = {
        where: { sourceId: mockArticleDomain.sourceId },
        transaction: undefined,
      };
      expect(articleModel.count).toHaveBeenCalledWith({
        where: { sourceId: expect.any(Object) },
        transaction: undefined,
      });
      expect(result).toBe(expectedCount);
    });

    it('기사가 없으면 0을 반환해야 한다', async () => {
      // Given: count가 0을 반환하는 경우
      articleModel.count.mockResolvedValue(0);

      // When: countBySourceId 호출
      const result = await repository.countBySourceId('non-existent-source');

      // Then: 0이 반환되어야 함
      expect(result).toBe(0);
    });
  });
});
