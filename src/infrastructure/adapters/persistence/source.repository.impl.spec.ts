/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceRepositoryImpl 단위 테스트
 * - Repository 계층의 CRUD 기능 테스트
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { SourceRepositoryImpl } from './source.repository.impl';
import { Source } from '../../../entities';
import { SourceDomain } from '../../../domain/entities/source.domain';
import { v4 as uuidv4 } from 'uuid';

describe('SourceRepositoryImpl', () => {
  let repository: SourceRepositoryImpl;
  let sourceModel: jest.Mocked<typeof Source>;

  // 테스트용 샘플 도메인 데이터
  const mockSourceDomain = new SourceDomain(
    uuidv4(),
    'Test Source',
    'https://example.com',
    new Date(),
    new Date(),
  );

  // 테스트용 샘플 엔티티 데이터
  const mockSourceEntity = {
    id: mockSourceDomain.id,
    title: mockSourceDomain.title,
    targetUrl: mockSourceDomain.targetUrl,
    createdAt: mockSourceDomain.createdAt,
    updatedAt: mockSourceDomain.updatedAt,
    get: jest.fn((key: string) => {
      const data: any = {
        id: mockSourceDomain.id,
        title: mockSourceDomain.title,
        targetUrl: mockSourceDomain.targetUrl,
        createdAt: mockSourceDomain.createdAt,
        updatedAt: mockSourceDomain.updatedAt,
      };
      return data[key];
    }),
    toJSON: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    // Source 모델 목(Mock) 생성
    const mockSourceModel = {
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      upsert: jest.fn(),
      destroy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceRepositoryImpl,
        {
          provide: getModelToken(Source),
          useValue: mockSourceModel,
        },
      ],
    }).compile();

    repository = module.get<SourceRepositoryImpl>(SourceRepositoryImpl);
    sourceModel = module.get(getModelToken(Source));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('ID로 소스를 찾아야 한다', async () => {
      // Given: findByPk가 레코드를 반환하는 경우
      sourceModel.findByPk.mockResolvedValue(mockSourceEntity as any);

      // When: findById 호출
      const result = await repository.findById(mockSourceDomain.id);

      // Then: 소스가 반환되어야 함
      expect(sourceModel.findByPk).toHaveBeenCalledWith(mockSourceDomain.id);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockSourceDomain.id);
      expect(result).toBeInstanceOf(SourceDomain);
    });

    it('소스가 없으면 null을 반환해야 한다', async () => {
      // Given: findByPk가 null을 반환하는 경우
      sourceModel.findByPk.mockResolvedValue(null);

      // When: findById 호출
      const result = await repository.findById('non-existent-id');

      // Then: null이 반환되어야 함
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('title로 소스를 찾아야 한다', async () => {
      // Given: findOne이 레코드를 반환하는 경우
      sourceModel.findOne.mockResolvedValue(mockSourceEntity as any);

      // When: findByName 호출
      const result = await repository.findByName(mockSourceDomain.title);

      // Then: 소스가 반환되어야 함
      expect(sourceModel.findOne).toHaveBeenCalledWith({
        where: { title: mockSourceDomain.title },
      });
      expect(result).not.toBeNull();
      expect(result?.title).toBe(mockSourceDomain.title);
      expect(result).toBeInstanceOf(SourceDomain);
    });

    it('title로 소스를 찾지 못하면 null을 반환해야 한다', async () => {
      // Given: findOne이 null을 반환하는 경우
      sourceModel.findOne.mockResolvedValue(null);

      // When: findByName 호출
      const result = await repository.findByName('Non Existent Source');

      // Then: null이 반환되어야 함
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('모든 소스를 title 오름차순으로 조회해야 한다', async () => {
      // Given: findAll이 소스 목록을 반환하는 경우
      const mockSources = [
        mockSourceEntity,
        {
          ...mockSourceEntity,
          id: uuidv4(),
          title: 'Another Source',
        },
      ];
      sourceModel.findAll.mockResolvedValue(mockSources as any);

      // When: findAll 호출
      const result = await repository.findAll();

      // Then: 소스 목록이 반환되어야 함
      expect(sourceModel.findAll).toHaveBeenCalledWith({
        order: [['title', 'ASC']],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(SourceDomain);
      expect(result[1]).toBeInstanceOf(SourceDomain);
    });

    it('소스가 없으면 빈 배열을 반환해야 한다', async () => {
      // Given: findAll이 빈 배열을 반환하는 경우
      sourceModel.findAll.mockResolvedValue([]);

      // When: findAll 호출
      const result = await repository.findAll();

      // Then: 빈 배열이 반환되어야 함
      expect(result).toHaveLength(0);
    });
  });

  describe('findAllActive', () => {
    it('PRD 구조에 맞춰 모든 소스를 조회해야 한다 (isActive 필터 없음)', async () => {
      // Given: findAll이 소스 목록을 반환하는 경우
      const mockSources = [mockSourceEntity];
      sourceModel.findAll.mockResolvedValue(mockSources as any);

      // When: findAllActive 호출
      const result = await repository.findAllActive();

      // Then: isActive 필터 없이 모든 소스가 반환되어야 함
      expect(sourceModel.findAll).toHaveBeenCalledWith({
        order: [['title', 'ASC']],
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SourceDomain);
    });

    it('findAll과 동일한 동작을 해야 한다', async () => {
      // Given: 동일한 mock 설정
      const mockSources = [mockSourceEntity];
      sourceModel.findAll.mockResolvedValue(mockSources as any);

      // When: findAll과 findAllActive를 각각 호출
      const resultFindAll = await repository.findAll();
      sourceModel.findAll.mockClear(); // mock 호출 기록 초기화
      sourceModel.findAll.mockResolvedValue(mockSources as any);
      const resultFindAllActive = await repository.findAllActive();

      // Then: 동일한 결과를 반환해야 함
      expect(resultFindAll).toHaveLength(resultFindAllActive.length);
      expect(resultFindAll[0].id).toBe(resultFindAllActive[0].id);
    });
  });

  describe('save', () => {
    it('새 소스를 성공적으로 저장해야 한다', async () => {
      // Given: upsert가 새로운 레코드를 생성하는 경우
      sourceModel.upsert.mockResolvedValue([mockSourceEntity, true] as any);

      // When: save 메서드 호출
      const result = await repository.save(mockSourceDomain);

      // Then: 정상적으로 저장되고 도메인 엔티티가 반환되어야 함
      expect(sourceModel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockSourceDomain.id,
          title: mockSourceDomain.title,
          targetUrl: mockSourceDomain.targetUrl,
        }),
      );
      expect(result).toBeInstanceOf(SourceDomain);
      expect(result.id).toBe(mockSourceDomain.id);
    });

    it('기존 소스를 업데이트해야 한다', async () => {
      // Given: upsert가 기존 레코드를 업데이트하는 경우
      sourceModel.upsert.mockResolvedValue([mockSourceEntity, false] as any);

      // When: save 메서드 호출
      const result = await repository.save(mockSourceDomain);

      // Then: 업데이트가 성공해야 함
      expect(sourceModel.upsert).toHaveBeenCalled();
      expect(result.id).toBe(mockSourceDomain.id);
    });

    it('저장 실패 시 에러를 던져야 한다', async () => {
      // Given: upsert가 실패하는 경우
      const errorMessage = 'Database error';
      sourceModel.upsert.mockRejectedValue(new Error(errorMessage));

      // When & Then: 에러가 발생해야 함
      await expect(repository.save(mockSourceDomain)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateLastScrapedAt', () => {
    it('PRD에 lastScrapedAt 필드가 없으므로 no-op이어야 한다', async () => {
      // When: updateLastScrapedAt 호출
      const result = await repository.updateLastScrapedAt(mockSourceDomain.id);

      // Then: 항상 true를 반환하고 실제 업데이트는 하지 않아야 함
      expect(result).toBe(true);
      expect(sourceModel.upsert).not.toHaveBeenCalled();
    });

    it('어떤 ID를 전달해도 true를 반환해야 한다', async () => {
      // When: 다양한 ID로 updateLastScrapedAt 호출
      const result1 = await repository.updateLastScrapedAt('id-1');
      const result2 = await repository.updateLastScrapedAt('id-2');
      const result3 = await repository.updateLastScrapedAt('non-existent');

      // Then: 모두 true를 반환해야 함
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });
  });

  describe('delete', () => {
    it('소스를 성공적으로 삭제해야 한다', async () => {
      // Given: destroy가 1을 반환하는 경우 (1개 삭제됨)
      sourceModel.destroy.mockResolvedValue(1);

      // When: delete 메서드 호출
      const result = await repository.delete(mockSourceDomain.id);

      // Then: 삭제가 성공해야 함
      expect(sourceModel.destroy).toHaveBeenCalledWith({
        where: { id: mockSourceDomain.id },
      });
      expect(result).toBe(true);
    });

    it('삭제할 소스가 없으면 false를 반환해야 한다', async () => {
      // Given: destroy가 0을 반환하는 경우 (삭제된 레코드 없음)
      sourceModel.destroy.mockResolvedValue(0);

      // When: delete 메서드 호출
      const result = await repository.delete('non-existent-id');

      // Then: false가 반환되어야 함
      expect(result).toBe(false);
    });

    it('삭제 실패 시 에러를 던져야 한다', async () => {
      // Given: destroy가 실패하는 경우
      const errorMessage = 'Delete failed';
      sourceModel.destroy.mockRejectedValue(new Error(errorMessage));

      // When & Then: 에러가 발생해야 함
      await expect(repository.delete(mockSourceDomain.id)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('Integration scenarios', () => {
    it('소스를 생성하고 조회하는 시나리오', async () => {
      // Given: 소스 생성 및 조회 설정
      sourceModel.upsert.mockResolvedValue([mockSourceEntity, true] as any);
      sourceModel.findByPk.mockResolvedValue(mockSourceEntity as any);

      // When: 소스 저장 후 조회
      const saved = await repository.save(mockSourceDomain);
      const found = await repository.findById(saved.id);

      // Then: 저장과 조회가 모두 성공해야 함
      expect(saved.id).toBe(mockSourceDomain.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(saved.id);
    });

    it('소스를 생성, 수정, 삭제하는 전체 라이프사이클', async () => {
      // Given: 생성, 수정, 삭제 설정
      sourceModel.upsert
        .mockResolvedValueOnce([mockSourceEntity, true] as any) // 생성
        .mockResolvedValueOnce([
          {
            ...mockSourceEntity,
            title: 'Updated Source',
            get: jest.fn((key: string) => {
              const data: any = {
                id: mockSourceDomain.id,
                title: 'Updated Source',
                targetUrl: mockSourceDomain.targetUrl,
                createdAt: mockSourceDomain.createdAt,
                updatedAt: new Date(),
              };
              return data[key];
            }),
          },
          false,
        ] as any); // 수정
      sourceModel.destroy.mockResolvedValue(1);

      // When: 생성 -> 수정 -> 삭제
      const created = await repository.save(mockSourceDomain);
      const updated = await repository.save(
        new SourceDomain(
          mockSourceDomain.id,
          'Updated Source',
          mockSourceDomain.targetUrl,
          mockSourceDomain.createdAt,
          new Date(),
        ),
      );
      const deleted = await repository.delete(created.id);

      // Then: 모든 작업이 성공해야 함
      expect(created.id).toBe(mockSourceDomain.id);
      expect(updated.title).toBe('Updated Source');
      expect(deleted).toBe(true);
    });
  });
});
