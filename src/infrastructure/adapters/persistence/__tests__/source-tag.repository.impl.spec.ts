/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTagRepositoryImpl 단위 테스트
 */
import {Test, TestingModule} from '@nestjs/testing';
import {getModelToken} from '@nestjs/sequelize';
import {SourceTagRepositoryImpl} from '../source-tag.repository.impl';
import {SourceTag} from '../../../../entities/entity.module';
import {SourceTagDomain} from '../../../../domain/entities/source-tag.domain';

describe('SourceTagRepositoryImpl', () => {
  let repository: SourceTagRepositoryImpl;
  let mockSourceTagModel: any;

  const mockSourceTag = {
    id: 1,
    sourceId: '123e4567-e89b-12d3-a456-426614174000',
    fieldName: 'title',
    tagName: 'h1',
    className: 'article-title',
    createdAt: new Date('2025-01-13'),
  };

  beforeEach(async () => {
    // Mock Sequelize Model
    mockSourceTagModel = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceTagRepositoryImpl,
        {
          provide: getModelToken(SourceTag),
          useValue: mockSourceTagModel,
        },
      ],
    }).compile();

    repository = module.get<SourceTagRepositoryImpl>(SourceTagRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findBySourceId', () => {
    it('특정 소스의 모든 태그를 조회해야 합니다', async () => {
      // Given
      const sourceId = '123e4567-e89b-12d3-a456-426614174000';
      mockSourceTagModel.findAll.mockResolvedValue([mockSourceTag]);

      // When
      const result = await repository.findBySourceId(sourceId);

      // Then
const expectedWhere = {
        where: {
          sourceId: expect.any(Object) // Buffer 타입은 내부 구조만 검사
        },
      };
      expect(mockSourceTagModel.findAll).toHaveBeenCalledWith({
        where: { sourceId: expect.any(Object) },
        order: [['field_name', 'ASC']],
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SourceTagDomain);
      expect(result[0].id).toBe(mockSourceTag.id);
    });

    it('태그가 없으면 빈 배열을 반환해야 합니다', async () => {
      // Given
      mockSourceTagModel.findAll.mockResolvedValue([]);

      // When
      const result = await repository.findBySourceId('non-existent-id');

      // Then
      expect(result).toEqual([]);
    });
  });

});
