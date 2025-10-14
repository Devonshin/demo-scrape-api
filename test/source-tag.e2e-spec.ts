/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag API E2E 테스트
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SourceTag } from '../src/entities/source-tag.entity';
import { Source } from '../src/entities/source.entity';
import { getModelToken } from '@nestjs/sequelize';

describe('SourceTag API (e2e)', () => {
  let app: INestApplication;
  let sourceTagModel: typeof SourceTag;
  let sourceModel: typeof Source;
  let testSourceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // ValidationPipe 설정 (실제 앱과 동일하게)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    sourceTagModel = moduleFixture.get(getModelToken(SourceTag));
    sourceModel = moduleFixture.get(getModelToken(Source));

    // 테스트용 Source 생성
    const testSource = await sourceModel.create({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Source',
      type: 'news',
      baseUrl: 'https://test.com',
      mainWrapper: '',
    });
    testSourceId = testSource.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await sourceTagModel.destroy({ where: {} });
    await sourceModel.destroy({ where: { id: testSourceId } });
    await app.close();
  });

  beforeEach(async () => {
    // 각 테스트 전에 SourceTag 데이터 정리
    await sourceTagModel.destroy({ where: {} });
  });

  describe('POST /source-tags', () => {
    it('새로운 소스 태그를 생성해야 합니다', async () => {
      const createDto = {
        sourceId: testSourceId,
        fieldName: 'title',
        tagName: 'h1',
        className: 'article-title',
      };

      const response = await request(app.getHttpServer())
        .post('/source-tags')
        .send(createDto)
        .expect(201);

      expect(response.body.data).toMatchObject({
        sourceId: testSourceId,
        fieldName: 'title',
        tagName: 'h1',
        className: 'article-title',
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('className 없이도 생성할 수 있어야 합니다', async () => {
      const createDto = {
        sourceId: testSourceId,
        fieldName: 'summary',
        tagName: 'p',
      };

      const response = await request(app.getHttpServer())
        .post('/source-tags')
        .send(createDto)
        .expect(201);

      expect(response.body.data.className).toBeNull();
    });

    it('중복된 태그 생성 시 409 에러를 반환해야 합니다', async () => {
      const createDto = {
        sourceId: testSourceId,
        fieldName: 'title',
        tagName: 'h1',
        className: 'test',
      };

      // 첫 번째 생성
      await request(app.getHttpServer())
        .post('/source-tags')
        .send(createDto)
        .expect(201);

      // 중복 생성 시도
      await request(app.getHttpServer())
        .post('/source-tags')
        .send(createDto)
        .expect(409);
    });

    it('유효하지 않은 데이터 입력 시 400 에러를 반환해야 합니다', async () => {
      const invalidDto = {
        sourceId: testSourceId,
        // fieldName 누락
        tagName: 'h1',
      };

      await request(app.getHttpServer())
        .post('/source-tags')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /source-tags', () => {
    beforeEach(async () => {
      // 테스트 데이터 생성
      await sourceTagModel.bulkCreate([
        {
          sourceId: testSourceId,
          fieldName: 'title',
          tagName: 'h1',
          className: 'title-class',
        },
        {
          sourceId: testSourceId,
          fieldName: 'summary',
          tagName: 'p',
          className: 'summary-class',
        },
        {
          sourceId: testSourceId,
          fieldName: 'date',
          tagName: 'span',
          className: null,
        },
      ]);
    });

    it('특정 소스의 모든 태그를 조회해야 합니다', async () => {
      const response = await request(app.getHttpServer())
        .get(`/source-tags?sourceId=${testSourceId}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].fieldName).toBeDefined();
    });

    it('존재하지 않는 소스의 태그 조회 시 빈 배열을 반환해야 합니다', async () => {
      const response = await request(app.getHttpServer())
        .get('/source-tags?sourceId=00000000-0000-0000-0000-000000000000')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /source-tags/:sourceId/:fieldName', () => {
    let createdTagId: number;

    beforeEach(async () => {
      const tag = await sourceTagModel.create({
        sourceId: testSourceId,
        fieldName: 'title',
        tagName: 'h1',
        className: 'test-class',
      });
      createdTagId = tag.id;
    });

    it('특정 필드의 태그를 조회해야 합니다', async () => {
      const response = await request(app.getHttpServer())
        .get(`/source-tags/${testSourceId}/title`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        fieldName: 'title',
        tagName: 'h1',
        className: 'test-class',
      });
    });

    it('존재하지 않는 필드 조회 시 null을 반환해야 합니다', async () => {
      const response = await request(app.getHttpServer())
        .get(`/source-tags/${testSourceId}/nonexistent`)
        .expect(200);

      expect(response.body.data).toBeNull();
    });
  });

  describe('PUT /source-tags/:id', () => {
    let createdTagId: number;

    beforeEach(async () => {
      const tag = await sourceTagModel.create({
        sourceId: testSourceId,
        fieldName: 'title',
        tagName: 'h1',
        className: 'old-class',
      });
      createdTagId = tag.id;
    });

    it('소스 태그를 수정해야 합니다', async () => {
      const updateDto = {
        fieldName: 'title',
        tagName: 'h2',
        className: 'new-class',
      };

      await request(app.getHttpServer())
        .put(`/source-tags/${createdTagId}`)
        .send(updateDto)
        .expect(204);

      // 수정 확인
      const updated = await sourceTagModel.findByPk(createdTagId);
      expect(updated?.tagName).toBe('h2');
      expect(updated?.className).toBe('new-class');
    });

    it('존재하지 않는 태그 수정 시 404 에러를 반환해야 합니다', async () => {
      const updateDto = {
        fieldName: 'title',
        tagName: 'h2',
      };

      await request(app.getHttpServer())
        .put('/source-tags/999999')
        .send(updateDto)
        .expect(409); // Use Case에서 ConflictException 발생
    });
  });

  describe('DELETE /source-tags/:id', () => {
    let createdTagId: number;

    beforeEach(async () => {
      const tag = await sourceTagModel.create({
        sourceId: testSourceId,
        fieldName: 'title',
        tagName: 'h1',
        className: 'test',
      });
      createdTagId = tag.id;
    });

    it('소스 태그를 삭제해야 합니다', async () => {
      await request(app.getHttpServer())
        .delete(`/source-tags/${createdTagId}`)
        .expect(204);

      // 삭제 확인
      const deleted = await sourceTagModel.findByPk(createdTagId);
      expect(deleted).toBeNull();
    });

    it('존재하지 않는 태그 삭제 시 404 에러를 반환해야 합니다', async () => {
      await request(app.getHttpServer())
        .delete('/source-tags/999999')
        .expect(404);
    });
  });

  describe('통합 시나리오: CRUD 전체 흐름', () => {
    it('생성 → 조회 → 수정 → 삭제 전체 흐름이 정상 동작해야 합니다', async () => {
      // 1. 생성
      const createDto = {
        sourceId: testSourceId,
        fieldName: 'link',
        tagName: 'a',
        className: 'article-link',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/source-tags')
        .send(createDto)
        .expect(201);

      const createdId = createResponse.body.data.id;

      // 2. 조회
      const getResponse = await request(app.getHttpServer())
        .get(`/source-tags/${testSourceId}/link`)
        .expect(200);

      expect(getResponse.body.data.id).toBe(createdId);
      expect(getResponse.body.data.className).toBe('article-link');

      // 3. 수정
      const updateDto = {
        fieldName: 'link',
        tagName: 'a',
        className: 'updated-link',
      };

      await request(app.getHttpServer())
        .put(`/source-tags/${createdId}`)
        .send(updateDto)
        .expect(204);

      // 수정 확인
      const updatedResponse = await request(app.getHttpServer())
        .get(`/source-tags/${testSourceId}/link`)
        .expect(200);

      expect(updatedResponse.body.data.className).toBe('updated-link');

      // 4. 삭제
      await request(app.getHttpServer())
        .delete(`/source-tags/${createdId}`)
        .expect(204);

      // 삭제 확인
      const deletedResponse = await request(app.getHttpServer())
        .get(`/source-tags/${testSourceId}/link`)
        .expect(200);

      expect(deletedResponse.body.data).toBeNull();
    });
  });
});
