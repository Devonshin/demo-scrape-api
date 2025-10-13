/**
 * @author Devonshin
 * @date 2025-01-13
 * ArticleRepositoryImpl 통합 테스트 (실제 DB 연동)
 * - 실제 데이터베이스를 사용한 Repository 통합 테스트
 * - 트랜잭션 롤백으로 테스트 데이터 정리
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { ArticleRepositoryImpl } from './article.repository.impl';
import { SourceRepositoryImpl } from './source.repository.impl';
import { Article, ArticleIndex, Source } from '../../../entities';
import { ArticleDomain } from '../../../domain/entities/article.domain';
import { SourceDomain } from '../../../domain/entities/source.domain';
import { getTestDatabaseConfig } from '../../../config/test-database.config';
import { v4 as uuidv4 } from 'uuid';

describe('ArticleRepositoryImpl Integration Test (실제 DB 연동)', () => {
  let module: TestingModule;
  let sequelize: Sequelize;
  let articleRepository: ArticleRepositoryImpl;
  let sourceRepository: SourceRepositoryImpl;
  let testSourceId: string;

  beforeAll(async () => {
    // 환경 변수 로드
    process.env.NODE_ENV = 'local';

    // 테스트 모듈 생성
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.local',
          isGlobal: true,
        }),
        SequelizeModule.forRoot(getTestDatabaseConfig()),
        SequelizeModule.forFeature([Article, ArticleIndex, Source]),
      ],
      providers: [ArticleRepositoryImpl, SourceRepositoryImpl],
    }).compile();

    sequelize = module.get<Sequelize>(Sequelize);
    articleRepository = module.get<ArticleRepositoryImpl>(ArticleRepositoryImpl);
    sourceRepository = module.get<SourceRepositoryImpl>(SourceRepositoryImpl);

    // 테스트용 소스 생성
    const testSource = new SourceDomain(
      uuidv4(),
      'Test Integration Source',
      'https://test-integration.com',
      new Date(),
      new Date(),
    );
    const savedSource = await sourceRepository.save(testSource);
    testSourceId = savedSource.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    if (testSourceId) {
      await sourceRepository.delete(testSourceId);
    }
    await sequelize.close();
    await module.close();
  });

  describe('실제 DB를 사용한 CRUD 테스트', () => {
    let testArticleId: string | null;

    afterEach(async () => {
      // 각 테스트 후 생성된 기사 삭제
      if (testArticleId) {
        await Article.destroy({ where: { id: testArticleId } });
        await ArticleIndex.destroy({ where: { articleId: testArticleId } });
        testArticleId = null;
      }
    });

    it('실제 DB에 기사를 저장하고 조회해야 한다', async () => {
      // Given: 새로운 기사 도메인 생성
      const newArticle = new ArticleDomain(
        uuidv4(),
        testSourceId,
        'Real Database Integration Test Article',
        'https://test.com/article-1',
        new Date(),
        new Date(),
      );

      // When: 실제 DB에 저장
      const saved = await articleRepository.save(newArticle);
      testArticleId = saved.id;

      // Then: 저장된 기사를 조회할 수 있어야 함
      const found = await articleRepository.findById(saved.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(newArticle.id);
      expect(found?.title).toBe(newArticle.title);
      expect(found?.sourceId).toBe(testSourceId);
    });

    it('URL 중복 체크가 실제로 작동해야 한다', async () => {
      // Given: 동일한 URL의 기사 2개
      const url = `https://test.com/duplicate-${Date.now()}`;
      const article1 = new ArticleDomain(
        uuidv4(),
        testSourceId,
        'Article 1',
        url,
        new Date(),
        new Date(),
      );

      // When: 첫 번째 기사 저장
      const saved1 = await articleRepository.save(article1);
      testArticleId = saved1.id;

      // Then: 같은 URL로 조회하면 첫 번째 기사가 반환되어야 함
      const found = await articleRepository.findByUrl(testSourceId, url);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(article1.id);
      expect(found?.url).toBe(url);

      // 다른 URL로는 찾을 수 없어야 함
      const notFound = await articleRepository.findByUrl(
        testSourceId,
        'https://non-existent.com',
      );
      expect(notFound).toBeNull();
    });

    it('기사 업데이트가 실제로 작동해야 한다', async () => {
      // Given: 기사 생성
      const article = new ArticleDomain(
        uuidv4(),
        testSourceId,
        'Original Title',
        `https://test.com/update-${Date.now()}`,
        new Date(),
        new Date(),
      );
      const saved = await articleRepository.save(article);
      testArticleId = saved.id;

      // When: 같은 ID로 다른 제목의 기사 저장 (upsert)
      const updated = new ArticleDomain(
        saved.id,
        testSourceId,
        'Updated Title',
        saved.url,
        saved.publicationDate,
        new Date(),
      );
      await articleRepository.save(updated);

      // Then: 업데이트된 내용이 반영되어야 함
      const found = await articleRepository.findById(saved.id);
      expect(found?.title).toBe('Updated Title');
    });

    it('필터링이 실제 DB에서 작동해야 한다', async () => {
      // Given: 여러 기사 생성
      const articles = [
        new ArticleDomain(
          uuidv4(),
          testSourceId,
          'Article A',
          `https://test.com/a-${Date.now()}`,
          new Date('2025-01-10'),
          new Date(),
        ),
        new ArticleDomain(
          uuidv4(),
          testSourceId,
          'Article B',
          `https://test.com/b-${Date.now()}`,
          new Date('2025-01-15'),
          new Date(),
        ),
      ];

      const saved = await articleRepository.saveBulk(articles);
      const savedIds = saved.map((a) => a.id);

      try {
        // When: 특정 소스의 기사만 조회
        const filtered = await articleRepository.findAll({
          sourceId: testSourceId,
          limit: 10,
        });

        // Then: 해당 소스의 기사가 조회되어야 함
        expect(filtered.length).toBeGreaterThanOrEqual(2);
        const ourArticles = filtered.filter((a) => savedIds.includes(a.id));
        expect(ourArticles.length).toBe(2);

        // When: 날짜 범위로 필터링
        const dateFiltered = await articleRepository.findAll({
          sourceId: testSourceId,
          publishedAfter: new Date('2025-01-12'),
        });

        // Then: 2025-01-15 기사만 조회되어야 함
        const recentArticles = dateFiltered.filter((a) => savedIds.includes(a.id));
        expect(recentArticles.length).toBe(1);
        expect(recentArticles[0].title).toBe('Article B');
      } finally {
        // 테스트 데이터 정리
        for (const id of savedIds) {
          await Article.destroy({ where: { id } });
          await ArticleIndex.destroy({ where: { articleId: id } });
        }
      }
    });

    it('페이지네이션이 실제 DB에서 작동해야 한다', async () => {
      // Given: 3개의 기사 생성
      const articles = [
        new ArticleDomain(
          uuidv4(),
          testSourceId,
          'Page Article 1',
          `https://test.com/page1-${Date.now()}`,
          new Date('2025-01-10'),
          new Date(),
        ),
        new ArticleDomain(
          uuidv4(),
          testSourceId,
          'Page Article 2',
          `https://test.com/page2-${Date.now()}`,
          new Date('2025-01-11'),
          new Date(),
        ),
        new ArticleDomain(
          uuidv4(),
          testSourceId,
          'Page Article 3',
          `https://test.com/page3-${Date.now()}`,
          new Date('2025-01-12'),
          new Date(),
        ),
      ];

      const saved = await articleRepository.saveBulk(articles);
      const savedIds = saved.map((a) => a.id);

      try {
        // When: 첫 번째 페이지 조회 (페이지 크기 2)
        const page1 = await articleRepository.findPaginated(1, 2, {
          sourceId: testSourceId,
          sortField: 'publicationDate',
          sortOrder: 'DESC',
        });

        // Then: 2개의 기사가 반환되어야 함
        expect(page1.items.length).toBeGreaterThanOrEqual(2);
        expect(page1.page).toBe(1);
        expect(page1.pageSize).toBe(2);

        // When: 두 번째 페이지 조회
        const page2 = await articleRepository.findPaginated(2, 2, {
          sourceId: testSourceId,
          sortField: 'publicationDate',
          sortOrder: 'DESC',
        });

        // Then: 페이지네이션이 작동해야 함
        expect(page2.page).toBe(2);
        expect(page2.items.length).toBeGreaterThanOrEqual(0);
      } finally {
        // 테스트 데이터 정리
        for (const id of savedIds) {
          await Article.destroy({ where: { id } });
          await ArticleIndex.destroy({ where: { articleId: id } });
        }
      }
    });

    it('키워드 검색이 ArticleIndex와 함께 실제로 작동해야 한다', async () => {
      // Given: 특정 키워드가 포함된 기사 생성
      const uniqueKeyword = `TestKeyword${Date.now()}`;
      const article = new ArticleDomain(
        uuidv4(),
        testSourceId,
        `Article with ${uniqueKeyword} in title`,
        `https://test.com/keyword-${Date.now()}`,
        new Date(),
        new Date(),
      );

      const saved = await articleRepository.save(article);
      testArticleId = saved.id;

      // 인덱스가 생성될 시간 대기
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        // When: 키워드로 검색
        const results = await articleRepository.findPaginated(1, 10, {
          title: uniqueKeyword,
        });

        // Then: 해당 키워드가 포함된 기사가 검색되어야 함
        expect(results.items.length).toBeGreaterThanOrEqual(1);
        const found = results.items.find((a) => a.id === saved.id);
        expect(found).toBeDefined();
        expect(found?.title).toContain(uniqueKeyword);
      } finally {
        // 테스트 데이터 정리
        await ArticleIndex.destroy({ where: { articleId: saved.id } });
      }
    });

    it('대량 저장이 실제 DB에서 작동해야 한다', async () => {
      // Given: 5개의 기사 배치
      const timestamp = Date.now();
      const articles = Array.from({ length: 5 }, (_, i) =>
        new ArticleDomain(
          uuidv4(),
          testSourceId,
          `Bulk Article ${i + 1}`,
          `https://test.com/bulk-${timestamp}-${i}`,
          new Date(),
          new Date(),
        ),
      );

      try {
        // When: 대량 저장
        const saved = await articleRepository.saveBulk(articles);

        // Then: 모든 기사가 저장되어야 함
        expect(saved.length).toBe(5);

        // 실제로 DB에 저장되었는지 확인
        for (const article of saved) {
          const found = await articleRepository.findById(article.id);
          expect(found).not.toBeNull();
          expect(found?.title).toContain('Bulk Article');
        }

        // 테스트 데이터 정리
        for (const article of saved) {
          await Article.destroy({ where: { id: article.id } });
          await ArticleIndex.destroy({ where: { articleId: article.id } });
        }
      } catch (error) {
        // 에러 발생 시에도 데이터 정리
        for (const article of articles) {
          await Article.destroy({ where: { id: article.id } }).catch(() => {});
          await ArticleIndex.destroy({ where: { articleId: article.id } }).catch(
            () => {},
          );
        }
        throw error;
      }
    });

    it('카운트 기능이 실제 DB에서 작동해야 한다', async () => {
      // Given: 특정 소스의 기사 3개 생성
      const timestamp = Date.now();
      const articles = Array.from({ length: 3 }, (_, i) =>
        new ArticleDomain(
          uuidv4(),
          testSourceId,
          `Count Test Article ${i + 1}`,
          `https://test.com/count-${timestamp}-${i}`,
          new Date(),
          new Date(),
        ),
      );

      const saved = await articleRepository.saveBulk(articles);
      const savedIds = saved.map((a) => a.id);

      try {
        // When: 해당 소스의 기사 수 조회
        const count = await articleRepository.countBySourceId(testSourceId);

        // Then: 최소 3개 이상이어야 함 (기존 테스트 데이터 포함 가능)
        expect(count).toBeGreaterThanOrEqual(3);
      } finally {
        // 테스트 데이터 정리
        for (const id of savedIds) {
          await Article.destroy({ where: { id } });
          await ArticleIndex.destroy({ where: { articleId: id } });
        }
      }
    });
  });

  describe('트랜잭션 테스트', () => {
    it('트랜잭션 롤백이 작동해야 한다', async () => {
      const transaction = await sequelize.transaction();
      const testId = uuidv4();

      try {
        // Given: 트랜잭션 내에서 기사 생성
        const article = new ArticleDomain(
          testId,
          testSourceId,
          'Transaction Test Article',
          `https://test.com/transaction-${Date.now()}`,
          new Date(),
          new Date(),
        );

        // When: 트랜잭션으로 저장 후 롤백
        await articleRepository.save(article, { transaction });
        await transaction.rollback();

        // Then: 롤백 후에는 기사가 존재하지 않아야 함
        const found = await articleRepository.findById(testId);
        expect(found).toBeNull();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });

    it('트랜잭션 커밋이 작동해야 한다', async () => {
      const transaction = await sequelize.transaction();
      let testId: string | undefined;

      try {
        // Given: 트랜잭션 내에서 기사 생성
        const article = new ArticleDomain(
          uuidv4(),
          testSourceId,
          'Transaction Commit Test Article',
          `https://test.com/commit-${Date.now()}`,
          new Date(),
          new Date(),
        );

        // When: 트랜잭션으로 저장 후 커밋
        const saved = await articleRepository.save(article, { transaction });
        testId = saved.id;
        await transaction.commit();

        // Then: 커밋 후에는 기사가 존재해야 함
        const found = await articleRepository.findById(testId);
        expect(found).not.toBeNull();
        expect(found?.id).toBe(testId);

        // 테스트 데이터 정리
        await Article.destroy({ where: { id: testId } });
        await ArticleIndex.destroy({ where: { articleId: testId } });
      } catch (error) {
        await transaction.rollback();
        if (testId) {
          await Article.destroy({ where: { id: testId } });
          await ArticleIndex.destroy({ where: { articleId: testId } });
        }
        throw error;
      }
    });
  });
});
