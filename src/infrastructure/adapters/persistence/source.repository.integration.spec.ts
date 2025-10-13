/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceRepositoryImpl 통합 테스트 (실제 DB 연동)
 * - 실제 데이터베이스를 사용한 Repository 통합 테스트
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { SourceRepositoryImpl } from './source.repository.impl';
import { Source } from '../../../entities';
import { SourceDomain } from '../../../domain/entities/source.domain';
import { getTestDatabaseConfig } from '../../../config/test-database.config';
import { v4 as uuidv4 } from 'uuid';

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
        SequelizeModule.forFeature([Source]),
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

  describe('실제 DB를 사용한 CRUD 테스트', () => {
    let testSourceId: string | null;

    afterEach(async () => {
      // 각 테스트 후 생성된 소스 삭제
      if (testSourceId) {
        await Source.destroy({ where: { id: testSourceId } });
        testSourceId = null;
      }
    });

    it('실제 DB에 소스를 저장하고 조회해야 한다', async () => {
      // Given: 새로운 소스 도메인 생성
      const newSource = new SourceDomain(
        uuidv4(),
        `Integration Test Source ${Date.now()}`,
        'https://integration-test.com',
        new Date(),
        new Date(),
      );

      // When: 실제 DB에 저장
      const saved = await sourceRepository.save(newSource);
      testSourceId = saved.id;

      // Then: 저장된 소스를 조회할 수 있어야 함
      const found = await sourceRepository.findById(saved.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(newSource.id);
      expect(found?.title).toBe(newSource.title);
      expect(found?.targetUrl).toBe(newSource.targetUrl);
    });

    it('title로 소스를 조회할 수 있어야 한다', async () => {
      // Given: 고유한 title의 소스 생성
      const uniqueTitle = `Unique Source ${Date.now()}`;
      const source = new SourceDomain(
        uuidv4(),
        uniqueTitle,
        'https://unique-source.com',
        new Date(),
        new Date(),
      );

      const saved = await sourceRepository.save(source);
      testSourceId = saved.id;

      // When: title로 조회
      const found = await sourceRepository.findByName(uniqueTitle);

      // Then: 해당 소스가 조회되어야 함
      expect(found).not.toBeNull();
      expect(found?.id).toBe(saved.id);
      expect(found?.title).toBe(uniqueTitle);
    });

    it('존재하지 않는 title로 조회하면 null을 반환해야 한다', async () => {
      // When: 존재하지 않는 title로 조회
      const found = await sourceRepository.findByName('Non Existent Source Title');

      // Then: null이 반환되어야 함
      expect(found).toBeNull();
    });

    it('소스를 업데이트할 수 있어야 한다', async () => {
      // Given: 소스 생성
      const source = new SourceDomain(
        uuidv4(),
        'Original Source Title',
        'https://original.com',
        new Date(),
        new Date(),
      );

      const saved = await sourceRepository.save(source);
      testSourceId = saved.id;

      // When: 같은 ID로 다른 정보의 소스 저장 (upsert)
      const updated = new SourceDomain(
        saved.id,
        'Updated Source Title',
        'https://updated.com',
        saved.createdAt,
        new Date(),
      );
      await sourceRepository.save(updated);

      // Then: 업데이트된 내용이 반영되어야 함
      const found = await sourceRepository.findById(saved.id);
      expect(found?.title).toBe('Updated Source Title');
      expect(found?.targetUrl).toBe('https://updated.com');
    });

    it('소스를 삭제할 수 있어야 한다', async () => {
      // Given: 소스 생성
      const source = new SourceDomain(
        uuidv4(),
        `Delete Test Source ${Date.now()}`,
        'https://delete-test.com',
        new Date(),
        new Date(),
      );

      const saved = await sourceRepository.save(source);
      testSourceId = saved.id;

      // When: 소스 삭제
      const deleted = await sourceRepository.delete(saved.id);

      // Then: 삭제가 성공해야 하고 조회되지 않아야 함
      expect(deleted).toBe(true);
      const found = await sourceRepository.findById(saved.id);
      expect(found).toBeNull();

      testSourceId = null; // 이미 삭제되었으므로 null 설정
    });

    it('존재하지 않는 소스를 삭제하면 false를 반환해야 한다', async () => {
      // When: 존재하지 않는 ID로 삭제 시도
      const deleted = await sourceRepository.delete(uuidv4());

      // Then: false가 반환되어야 함
      expect(deleted).toBe(false);
    });
  });

  describe('findAll 및 findAllActive 테스트', () => {
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

      for (const source of sources) {
        const saved = await sourceRepository.save(source);
        testSourceIds.push(saved.id);
      }
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

      // Then: 최소 3개 이상 조회되어야 함
      expect(sources.length).toBeGreaterThanOrEqual(3);

      // 생성한 테스트 소스가 포함되어야 함
      const testSources = sources.filter((s) => testSourceIds.includes(s.id));
      expect(testSources.length).toBe(3);

      // title 오름차순 정렬 확인
      for (let i = 1; i < sources.length; i++) {
        expect(sources[i].title.localeCompare(sources[i - 1].title)).toBeGreaterThanOrEqual(0);
      }
    });

    it('findAllActive가 findAll과 동일하게 작동해야 한다 (isActive 필터 없음)', async () => {
      // When: findAll과 findAllActive 각각 호출
      const allSources = await sourceRepository.findAll();
      const activeSources = await sourceRepository.findAllActive();

      // Then: 결과가 동일해야 함 (PRD에 isActive 필드 없음)
      expect(activeSources.length).toBe(allSources.length);

      // 모든 ID가 일치해야 함
      const allIds = new Set(allSources.map((s) => s.id));
      const activeIds = new Set(activeSources.map((s) => s.id));
      expect(allIds.size).toBe(activeIds.size);

      activeSources.forEach((source) => {
        expect(allIds.has(source.id)).toBe(true);
      });
    });
  });

  describe('updateLastScrapedAt 테스트', () => {
    it('PRD에 lastScrapedAt 필드가 없으므로 항상 true를 반환해야 한다', async () => {
      // Given: 임의의 소스 ID
      const sourceId = uuidv4();

      // When: updateLastScrapedAt 호출
      const result = await sourceRepository.updateLastScrapedAt(sourceId);

      // Then: 항상 true를 반환해야 함 (no-op)
      expect(result).toBe(true);
    });

    it('실제로 존재하는 소스에 대해서도 no-op이어야 한다', async () => {
      // Given: 실제 소스 생성
      const source = new SourceDomain(
        uuidv4(),
        `LastScraped Test ${Date.now()}`,
        'https://lastscraped-test.com',
        new Date(),
        new Date(),
      );
      const saved = await sourceRepository.save(source);

      try {
        // When: updateLastScrapedAt 호출
        const result = await sourceRepository.updateLastScrapedAt(saved.id);

        // Then: true를 반환하지만 실제 업데이트는 없어야 함
        expect(result).toBe(true);

        // 소스 조회하여 updatedAt이 변경되지 않았는지 확인
        const found = await sourceRepository.findById(saved.id);
        expect(found?.updatedAt).toEqual(saved.updatedAt);
      } finally {
        await Source.destroy({ where: { id: saved.id } });
      }
    });
  });

  describe('전체 라이프사이클 테스트', () => {
    it('소스 생성 -> 조회 -> 수정 -> 삭제 전체 과정이 정상 작동해야 한다', async () => {
      // 1. 생성
      const timestamp = Date.now();
      const source = new SourceDomain(
        uuidv4(),
        `Lifecycle Test ${timestamp}`,
        'https://lifecycle-test.com',
        new Date(),
        new Date(),
      );

      const created = await sourceRepository.save(source);
      expect(created.id).toBe(source.id);
      expect(created.title).toBe(source.title);

      // 2. ID로 조회
      const foundById = await sourceRepository.findById(created.id);
      expect(foundById).not.toBeNull();
      expect(foundById?.id).toBe(created.id);

      // 3. title로 조회
      const foundByName = await sourceRepository.findByName(created.title);
      expect(foundByName).not.toBeNull();
      expect(foundByName?.id).toBe(created.id);

      // 4. 수정
      const updated = new SourceDomain(
        created.id,
        `Updated Lifecycle ${timestamp}`,
        'https://updated-lifecycle.com',
        created.createdAt,
        new Date(),
      );
      await sourceRepository.save(updated);

      const foundUpdated = await sourceRepository.findById(created.id);
      expect(foundUpdated?.title).toBe(`Updated Lifecycle ${timestamp}`);
      expect(foundUpdated?.targetUrl).toBe('https://updated-lifecycle.com');

      // 5. 삭제
      const deleted = await sourceRepository.delete(created.id);
      expect(deleted).toBe(true);

      const foundDeleted = await sourceRepository.findById(created.id);
      expect(foundDeleted).toBeNull();
    });
  });
});
