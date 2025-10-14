/**
 * @author Devonshin
 * @date 2025-01-24
 * Health Controller E2E 테스트
 * - 헬스체크 엔드포인트 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HealthController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('헬스체크 엔드포인트가 정상 응답해야 한다', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('GET /health/database', () => {
    it('데이터베이스 헬스체크가 응답해야 한다', () => {
      return request(app.getHttpServer())
        .get('/health/database')
        .expect((res) => {
          // DB 연결 상태에 따라 200 또는 503
          expect([200, 503]).toContain(res.status);
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('database');
        });
    });
  });

  describe('GET /health/memory', () => {
    it('메모리 상태 정보를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .get('/health/memory')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('memory');
          
          if (res.body.memory) {
            expect(res.body.memory).toHaveProperty('heapUsed');
            expect(res.body.memory).toHaveProperty('heapTotal');
            expect(res.body.memory).toHaveProperty('rss');
          }
        });
    });
  });
});
