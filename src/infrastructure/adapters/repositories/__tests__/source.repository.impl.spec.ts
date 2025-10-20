/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceRepositoryAdapter Tests unitaires
 * - Tester la fonctionnalité CRUD d'une couche de Repository
 */
import {Test, TestingModule} from '@nestjs/testing';
import {getModelToken} from '@nestjs/sequelize';
import {SourceRepositoryAdapter} from '../source.repository.adapter';
import {Source} from '../../../entities/entity.module';
import {SourceDomain} from '../../../../domain/entities/source.domain';
import {v4 as uuidv4} from 'uuid';
import {uuidToBuffer} from "../../../../common/utils/uuid.util";

describe('SourceRepositoryAdapter', () => {
  let repository: SourceRepositoryAdapter;
  let sourceModel: jest.Mocked<typeof Source>;

  const mockSourceDomain = new SourceDomain(
    uuidv4(),
    'Test Source',
    'https://example.com',
    '.main-content',
    new Date(),
    new Date(),
  );

  const mockSourceEntity = {
    id: mockSourceDomain.id,
    title: mockSourceDomain.title,
    targetUrl: mockSourceDomain.targetUrl,
    mainWrapper: mockSourceDomain.mainWrapper,
    createdAt: mockSourceDomain.createdAt,
    updatedAt: mockSourceDomain.updatedAt,
    get: jest.fn((key: string) => {
      const data: any = {
        id: mockSourceDomain.id,
        title: mockSourceDomain.title,
        targetUrl: mockSourceDomain.targetUrl,
        mainWrapper: mockSourceDomain.mainWrapper,
        createdAt: mockSourceDomain.createdAt,
        updatedAt: mockSourceDomain.updatedAt,
      };
      return data[key];
    }),
    toJSON: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const mockSourceModel = {
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      upsert: jest.fn(),
      destroy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceRepositoryAdapter,
        {
          provide: getModelToken(Source),
          useValue: mockSourceModel,
        },
      ],
    }).compile();

    repository = module.get<SourceRepositoryAdapter>(SourceRepositoryAdapter);
    sourceModel = module.get(getModelToken(Source));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('Trouver la source par l\'ID', async () => {
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
      // Given: Si findByPk renvoie null
      sourceModel.findByPk.mockResolvedValue(null);

      // When: Appel de findById
      const result = await repository.findById('non-existent-id');

      // Then: Doit renvoyer null
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('trouver la source par son titre', async () => {
      // Given: Si findOne renvoie un enregistrement
      sourceModel.findOne.mockResolvedValue(mockSourceEntity as any);

      // When: Appel de findByName
      const result = await repository.findByName(mockSourceDomain.title);

      // Then: La source doit être renvoyée
      expect(sourceModel.findOne).toHaveBeenCalledWith({
        where: { title: mockSourceDomain.title },
      });
      expect(result).not.toBeNull();
      expect(result?.title).toBe(mockSourceDomain.title);
      expect(result).toBeInstanceOf(SourceDomain);
    });

    it("Si la source n'est pas trouvée par le titre, nous devons renvoyer null", async () => {
      // Given: Si findOne renvoie null
      sourceModel.findOne.mockResolvedValue(null);

      // When: Appel de findByName
      const result = await repository.findByName('Non Existent Source');

      // Then: Doit renvoyer null
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it("Toutes les sources doivent être consultées dans l'ordre croissant de leur titre", async () => {
      // Given: Si findAll renvoie une liste de sources
      const mockSources = [
        mockSourceEntity,
        {
          ...mockSourceEntity,
          id: uuidToBuffer(uuidv4()),
          title: 'Another Source',
        },
      ];
      sourceModel.findAll.mockResolvedValue(mockSources as any);

      // When: Appel de findAll
      const result = await repository.findAll();

      // Then: Une liste des sources doit être renvoyée
      expect(sourceModel.findAll).toHaveBeenCalledWith({
        order: [['title', 'ASC']],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(SourceDomain);
      expect(result[1]).toBeInstanceOf(SourceDomain);
    });

    it("S'il n'y a pas de source, nous devons renvoyer un tableau vide", async () => {
      // Given: Si findAll renvoie un tableau vide, utilisez la fonction
      sourceModel.findAll.mockResolvedValue([]);

      // When: Appel de findAll
      const result = await repository.findAll();

      // Then: Un tableau vide doit être renvoyé
      expect(result).toHaveLength(0);
    });
  });


});
