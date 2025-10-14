/**
 * @author Devonshin
 * @date 2025-01-24
 * Health Controller E2E 테스트
 * - 헬스체크 엔드포인트 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
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
  describe('GET /health/liveness', () => {
    it('애플리케이션이 실행 중임으로 정상 응답해야 한다', () => {
      return request(app.getHttpServer())
        .get('/health/liveness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('GET /health/readiness', () => {
    it('애플리케이션이 요청을 받을 준비가 됨으로 정상 응답해야 한다', () => {
      return request(app.getHttpServer())
        .get('/health/liveness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });

});
