/**
 * @author Devonshin
 * @date 2025-01-13
 * - Test de l'intégration du référentiel avec des bases de données réelles
 */
import {Test, TestingModule} from '@nestjs/testing';
import {SequelizeModule} from '@nestjs/sequelize';
import {ConfigModule} from '@nestjs/config';
import {Sequelize} from 'sequelize-typescript';
import {SourceRepositoryAdapter} from '../source.repository.adapter';
import {Article, ArticleIndex, Source, SourceTag} from '../../../entities/entity.module';
import {SourceDomain} from '../../../../domain/entities/source.domain';
import {getTestDatabaseConfig} from './test-database.config';
import {v4 as uuidv4} from 'uuid';

describe('SourceRepositoryAdapter Integration Test', () => {
  let module: TestingModule;
  let sequelize: Sequelize;
  let sourceRepository: SourceRepositoryAdapter;

  beforeAll(async () => {
    process.env.NODE_ENV = 'local';

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.local',
          isGlobal: true,
        }),
        SequelizeModule.forRoot(getTestDatabaseConfig()),
        SequelizeModule.forFeature([Source, Article, ArticleIndex, SourceTag]),
      ],
      providers: [SourceRepositoryAdapter],
    }).compile();

    sequelize = module.get<Sequelize>(Sequelize);
    sourceRepository = module.get<SourceRepositoryAdapter>(SourceRepositoryAdapter);
  });

  afterAll(async () => {
    await sequelize.close();
    await module.close();
  });

  describe("Test de findAll", () => {
    const testSourceIds: string[] = [];

    beforeAll(async () => {
      const timestamp = Date.now();
      const sources = [
        new SourceDomain(
          uuidv4(),
          `Test Source A ${timestamp}`,
          'https://test-a.com',
          '',
          new Date(),
          new Date(),
        ),
        new SourceDomain(
          uuidv4(),
          `Test Source B ${timestamp}`,
          'https://test-b.com',
          '',
          new Date(),
          new Date(),
        ),
        new SourceDomain(
          uuidv4(),
          `Test Source C ${timestamp}`,
          'https://test-c.com',
          '',
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

    it("findAll doit rechercher toutes les sources dans l'ordre croissant de leur titre", async () => {
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
