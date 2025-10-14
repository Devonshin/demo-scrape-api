/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceRepositoryImpl 단위 테스트
 * - Repository 계층의 CRUD 기능 테스트
 */
import {Test, TestingModule} from '@nestjs/testing';
import {getModelToken} from '@nestjs/sequelize';
import {SourceRepositoryImpl} from '../source.repository.impl';
import {Source} from '../../../../entities/entity.module';
import {SourceDomain} from '../../../../domain/entities/source.domain';
import {v4 as uuidv4} from 'uuid';
import {uuidToBuffer} from "../../../../common/utils/uuid.util";

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
      expect(sourceModel.findByPk).toHaveBeenCalledWith(expect.any(Object)); // Buffer 타입은 내부 구조만 검사
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
          id: uuidToBuffer(uuidv4()),
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


});
