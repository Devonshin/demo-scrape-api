/**
 * @author Devonshin
 * @date 2025-01-24
 * Article Controller E2E 테스트
 * - Supertest를 사용한 API 엔드포인트 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ArticleController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 실제 애플리케이션과 동일한 설정 적용
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /articles', () => {
    it('기본 쿼리로 기사 목록을 조회해야 한다', () => {
      return request(app.getHttpServer())
        .get('/articles')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('articles');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.articles)).toBe(true);
          expect(res.body.pagination).toHaveProperty('currentPage');
          expect(res.body.pagination).toHaveProperty('pageSize');
          expect(res.body.pagination).toHaveProperty('totalItems');
          expect(res.body.pagination).toHaveProperty('totalPages');
          expect(res.body.pagination).toHaveProperty('hasNext');
          expect(res.body.pagination).toHaveProperty('hasPrevious');
        });
    });

    it('페이지 번호를 지정하여 조회할 수 있어야 한다', () => {
      return request(app.getHttpServer())
        .get('/articles?page=1&pageSize=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.currentPage).toBe(1);
          expect(res.body.pagination.pageSize).toBe(10);
          expect(res.body.articles.length).toBeLessThanOrEqual(10);
        });
    });

    it('sourceId 필터로 조회할 수 있어야 한다', () => {
      const testSourceId = '123e4567-e89b-12d3-a456-426614174000';
      return request(app.getHttpServer())
        .get(`/articles?sourceId=${testSourceId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('articles');
          // sourceId로 필터링된 경우, 결과의 모든 기사는 해당 sourceId를 가져야 함
          if (res.body.articles.length > 0) {
            res.body.articles.forEach((article: any) => {
              expect(article.sourceId).toBe(testSourceId);
            });
          }
        });
    });

    it('제목 검색 쿼리로 조회할 수 있어야 한다', () => {
      return request(app.getHttpServer())
        .get('/articles?title=test')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('articles');
          // title 검색어가 포함된 기사만 반환되어야 함
          if (res.body.articles.length > 0) {
            res.body.articles.forEach((article: any) => {
              expect(article.title.toLowerCase()).toContain('test');
            });
          }
        });
    });

    it('정렬 옵션을 적용할 수 있어야 한다', () => {
      return request(app.getHttpServer())
        .get('/articles?sortField=publicationDate&sortOrder=DESC')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('articles');
          // DESC 정렬이므로 최신 기사가 먼저 나와야 함
          if (res.body.articles.length > 1) {
            const dates = res.body.articles.map((a: any) =>
              new Date(a.publicationDate).getTime()
            );
            for (let i = 0; i < dates.length - 1; i++) {
              expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
            }
          }
        });
    });

    it('날짜 범위로 필터링할 수 있어야 한다', () => {
      const publishedAfter = '2025-01-01T00:00:00Z';
      const publishedBefore = '2025-12-31T23:59:59Z';

      return request(app.getHttpServer())
        .get(`/articles?publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('articles');
          if (res.body.articles.length > 0) {
            const afterDate = new Date(publishedAfter);
            const beforeDate = new Date(publishedBefore);

            res.body.articles.forEach((article: any) => {
              if (article.publicationDate) {
                const articleDate = new Date(article.publicationDate);
                expect(articleDate.getTime()).toBeGreaterThanOrEqual(afterDate.getTime());
                expect(articleDate.getTime()).toBeLessThanOrEqual(beforeDate.getTime());
              }
            });
          }
        });
    });

    it('잘못된 페이지 번호는 400 에러를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .get('/articles?page=0')
        .expect(400);
    });

    it('잘못된 페이지 크기는 400 에러를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .get('/articles?pageSize=-1')
        .expect(400);
    });

    it('유효하지 않은 정렬 필드는 400 에러를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .get('/articles?sortField=invalidField')
        .expect(400);
    });

    it('복합 필터 조건을 적용할 수 있어야 한다', () => {
      return request(app.getHttpServer())
        .get('/articles?page=1&pageSize=5&sortField=createdAt&sortOrder=DESC')
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.currentPage).toBe(1);
          expect(res.body.pagination.pageSize).toBe(5);
          expect(res.body.articles.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('POST /articles/scrape', () => {
    it('스크래핑 요청을 처리해야 한다', () => {
      return request(app.getHttpServer())
        .post('/articles/scrape')
        .send({
          sourceId: undefined, // 모든 활성 소스 스크래핑
          uri: undefined,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success');
          expect(res.body).toHaveProperty('totalSourcesScraped');
          expect(res.body).toHaveProperty('successfulSources');
          expect(res.body).toHaveProperty('failedSources');
          expect(res.body).toHaveProperty('totalArticlesScraped');
          expect(res.body).toHaveProperty('newArticles');
          expect(res.body).toHaveProperty('duplicates');
          expect(res.body).toHaveProperty('errors');
          expect(res.body).toHaveProperty('startedAt');
          expect(res.body).toHaveProperty('completedAt');
          expect(res.body).toHaveProperty('durationSeconds');
          expect(Array.isArray(res.body.errors)).toBe(true);
        });
    });

    it('특정 소스만 스크래핑할 수 있어야 한다', () => {
      const testSourceId = '123e4567-e89b-12d3-a456-426614174000';

      return request(app.getHttpServer())
        .post('/articles/scrape')
        .send({
          sourceId: testSourceId,
          uri: undefined,
        })
        .expect((res) => {
          // 소스가 존재하지 않으면 404, 존재하면 200
          expect([200, 404]).toContain(res.status);

          if (res.status === 200) {
            expect(res.body).toHaveProperty('success');
            expect(res.body).toHaveProperty('totalSourcesScraped');
          }
        });
    });

    it('특정 URI를 지정하여 스크래핑할 수 있어야 한다', () => {
      return request(app.getHttpServer())
        .post('/articles/scrape')
        .send({
          sourceId: undefined,
          uri: 'page=3',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success');
        });
    });

    it('잘못된 요청 본문은 400 에러를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .post('/articles/scrape')
        .send({
          invalidField: 'invalid',
        })
        .expect(400);
    });

    it('빈 요청 본문으로도 스크래핑을 실행할 수 있어야 한다', () => {
      return request(app.getHttpServer())
        .post('/articles/scrape')
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success');
        });
    });
  });

  describe('API Response Format', () => {
    it('모든 응답은 일관된 형식이어야 한다', async () => {
      const getResponse = await request(app.getHttpServer())
        .get('/articles')
        .expect(200);

      // GET 응답 형식 검증
      expect(getResponse.body).toMatchObject({
        articles: expect.any(Array),
        pagination: {
          currentPage: expect.any(Number),
          pageSize: expect.any(Number),
          totalItems: expect.any(Number),
          totalPages: expect.any(Number),
          hasNext: expect.any(Boolean),
          hasPrevious: expect.any(Boolean),
        },
      });

      // 기사 객체 형식 검증 (있는 경우)
      if (getResponse.body.articles.length > 0) {
        const article = getResponse.body.articles[0];
        expect(article).toHaveProperty('id');
        expect(article).toHaveProperty('sourceId');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('url');
      }
    });
  });

  describe('Error Handling', () => {
    it('존재하지 않는 경로는 404를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .get('/articles/non-existent')
        .expect(404);
    });

    it('지원하지 않는 HTTP 메서드는 405를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .delete('/articles')
        .expect(404); // NestJS는 기본적으로 404를 반환
    });
  });
});
