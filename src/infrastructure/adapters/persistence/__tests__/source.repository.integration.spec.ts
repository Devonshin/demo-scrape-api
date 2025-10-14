/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceRepositoryImpl 통합 테스트 (실제 DB 연동)
 * - 실제 데이터베이스를 사용한 Repository 통합 테스트
 */
import {Test, TestingModule} from '@nestjs/testing';
import {SequelizeModule} from '@nestjs/sequelize';
import {ConfigModule} from '@nestjs/config';
import {Sequelize} from 'sequelize-typescript';
import {SourceRepositoryImpl} from '../source.repository.impl';
import {Article, ArticleIndex, Source, SourceTag} from '../../../../entities/entity.module';
import {SourceDomain} from '../../../../domain/entities/source.domain';
import {getTestDatabaseConfig} from '../../../../config/test-database.config';
import {v4 as uuidv4} from 'uuid';

describe('SourceRepositoryImpl Integration Test (실제 DB 연동)', () => {
  let module: TestingModule;
  let sequelize: Sequelize;
  let sourceRepository: SourceRepositoryImpl;

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
        SequelizeModule.forFeature([Source, Article, ArticleIndex, SourceTag]),
      ],
      providers: [SourceRepositoryImpl],
    }).compile();

    sequelize = module.get<Sequelize>(Sequelize);
    sourceRepository = module.get<SourceRepositoryImpl>(SourceRepositoryImpl);
  });

  afterAll(async () => {
    await sequelize.close();
    await module.close();
  });

  describe('findAll 테스트', () => {
    const testSourceIds: string[] = [];

    beforeAll(async () => {
      // 테스트용 소스 3개 생성
      const timestamp = Date.now();
      const sources = [
        new SourceDomain(
          uuidv4(),
          `Test Source A ${timestamp}`,
          'https://test-a.com',
          new Date(),
          new Date(),
        ),
        new SourceDomain(
          uuidv4(),
          `Test Source B ${timestamp}`,
          'https://test-b.com',
          new Date(),
          new Date(),
        ),
        new SourceDomain(
          uuidv4(),
          `Test Source C ${timestamp}`,
          'https://test-c.com',
          new Date(),
          new Date(),
        ),
      ];

    });

    afterAll(async () => {
      // 테스트 데이터 정리
      for (const id of testSourceIds) {
        await Source.destroy({ where: { id } });
      }
    });

    it('findAll로 모든 소스를 title 오름차순으로 조회해야 한다', async () => {
      // When: 모든 소스 조회
      const sources = await sourceRepository.findAll();

      // Then: 최소 2개 이상 조회되어야 함
      expect(sources.length).toBeGreaterThanOrEqual(2);

      // title 오름차순 정렬 확인
      for (let i = 1; i < sources.length; i++) {
        expect(sources[i].title.localeCompare(sources[i - 1].title)).toBeGreaterThanOrEqual(0);
      }
    });

  });

});
