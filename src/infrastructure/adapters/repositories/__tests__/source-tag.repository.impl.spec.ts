/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTagRepositoryAdapter 단위 테스트
 */
import {Test, TestingModule} from '@nestjs/testing';
import {getModelToken} from '@nestjs/sequelize';
import {SourceTagRepositoryAdapter} from '../source-tag.repository.adapter';
import {SourceTag} from '../../../entities/entity.module';
import {SourceTagDomain} from '../../../../domain/entities/source-tag.domain';

describe('SourceTagRepositoryAdapter', () => {
  let repository: SourceTagRepositoryAdapter;
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
        SourceTagRepositoryAdapter,
        {
          provide: getModelToken(SourceTag),
          useValue: mockSourceTagModel,
        },
      ],
    }).compile();

    repository = module.get<SourceTagRepositoryAdapter>(SourceTagRepositoryAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findBySourceId', () => {
    it("Afficher toutes les étiquettes d'une source spécifique", async () => {
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
        where: {sourceId: expect.any(Object)},
        order: [['field_name', 'ASC']],
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SourceTagDomain);
      expect(result[0].id).toBe(mockSourceTag.id);
    });

    it("Retourne un tableau vide s'il n'y a pas de tags", async () => {
      // Given
      mockSourceTagModel.findAll.mockResolvedValue([]);

      // When
      const result = await repository.findBySourceId('non-existent-id');

      // Then
      expect(result).toEqual([]);
    });
  });

});
