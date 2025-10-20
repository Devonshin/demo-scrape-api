/**
 * @author Devonshin
 * @date 2025-01-13
 * Test des intégrations Scraper
 */
import {Test, TestingModule} from '@nestjs/testing';
import ScraperAdapter from '../scraper.adapter';
import {SourceTagRepositoryPort} from '../../../../application/ports/out/repositories/source-tag.repository.port';
import {SourceDomain} from '../../../../domain/entities/source.domain';
import {SourceTagDomain} from '../../../../domain/entities/source-tag.domain';

describe('Scraper Integration Tests', () => {
  let scraper: ScraperAdapter;
  let mockSourceTagRepository: jest.Mocked<SourceTagRepositoryPort>;

  beforeEach(async () => {
    // Mock SourceTagRepository 생성
    mockSourceTagRepository = {
      findById: jest.fn(),
      findBySourceId: jest.fn(),
      findBySourceIdAndFieldName: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<SourceTagRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperAdapter,
        {
          provide: 'SourceTagRepositoryPort',
          useValue: mockSourceTagRepository,
        },
      ],
    }).compile();

    scraper = module.get<ScraperAdapter>(ScraperAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Si aucune balise n'est définie", () => {
    it("Si la balise n'est pas présente, nous devons renvoyer une erreur", async () => {
      // Given: 태그 설정이 없는 소스
      const source = SourceDomain.create({
        id: 'test-source-2',
        title: 'No Tags Source',
        targetUrl: 'https://example.com',
        mainWrapper: '',
      });

      mockSourceTagRepository.findBySourceId.mockResolvedValue([]);

      // When: scrapeArticles 실행
      const result = await scraper.scrapeArticles(source);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No tags configured');
      expect(result.articles).toHaveLength(0);
    });

  });

  describe("Cas de sélecteurs non valides", () => {
    it("Les sélecteurs non valides doivent être traités correctement", async () => {
      // Given: Définition d'un sélecteur inexistant
      const source = SourceDomain.create({
        id: 'test-source-4',
        title: 'Invalid Selector Source',
        targetUrl: 'https://example.com',
        mainWrapper: '',
      });

      const invalidSelectorTags = [
        SourceTagDomain.create({
          id: 1,
          sourceId: 'test-source-4',
          fieldName: 'article_list',
          tagName: 'div',
          className: 'non-existent-class',
        }),
        SourceTagDomain.create({
          id: 2,
          sourceId: 'test-source-4',
          fieldName: 'title',
          tagName: 'h1',
          className: 'invalid',
        }),
        SourceTagDomain.create({
          id: 3,
          sourceId: 'test-source-4',
          fieldName: 'link',
          tagName: 'a',
          className: 'invalid',
        }),
      ];

      mockSourceTagRepository.findBySourceId.mockResolvedValue(invalidSelectorTags);

      // When & Then: Nécessité de simuler des requêtes HTTP réelles
      // Un sélecteur non valide renvoie un tableau vide et doit être traité normalement.
    });
  });

  describe("Test de la méthode canScrape", () => {
    it("doit renvoyer true s'il s'agit d'une URL valide", async () => {
      const validUrl = 'https://google.com';

      expect(await scraper.canScrape(validUrl)).toBe(true);
    });

    it("Doit renvoyer false si l'URL n'est pas valide", async () => {
      // When: Vérifier la présence d'URL non valides
      const invalidUrl = 'https://invalid-domain-that-does-not-exist-123456.com';

      // Then: false
      const result = await scraper.canScrape(invalidUrl);
      expect(result).toBe(false);
    });
  });

  describe("Tester la canonisation des URL", () => {
    it("Vous devez convertir les URL relatifs en URL absolus", () => {
      // todo
      // Note: normalizeUrl은 private 메서드이므로 간접적으로 테스트
      // 실제로는 scrapeArticles 실행 결과로 검증
    });

    it("S'il s'agit déjà d'un URL absolu, il doit être renvoyé tel quel.", () => {
      // todo
      // Note: 간접 테스트
    });
  });

  describe("Tests de performance", () => {
    it('대량의 기사를 처리할 수 있어야 한다', async () => {
      // Given: 많은 기사가 있는 페이지 시뮬레이션
      const source = SourceDomain.create({
        id: 'test-source-perf',
        title: 'Performance Test Source',
        targetUrl: 'https://example.com',
        mainWrapper: '',
      });

      const sourceTags = [
        SourceTagDomain.create({
          id: 1,
          sourceId: 'test-source-perf',
          fieldName: 'article_list',
          tagName: 'article',
          className: '',
        }),
        SourceTagDomain.create({
          id: 2,
          sourceId: 'test-source-perf',
          fieldName: 'title',
          tagName: 'h2',
          className: '',
        }),
        SourceTagDomain.create({
          id: 3,
          sourceId: 'test-source-perf',
          fieldName: 'link',
          tagName: 'a',
          className: '',
        }),
      ];

      mockSourceTagRepository.findBySourceId.mockResolvedValue(sourceTags);

      // When & Then: 성능 측정
      const startTime = Date.now();
      // todo
      // await scraper.scrapeArticles(source);
      const endTime = Date.now();
      const duration = endTime - startTime;
      // 성능 기준: 10초 이내
      // expect(duration).toBeLessThan(10000);
    });
  });

  describe("Test de l'analyse de la date", () => {
    it("Être capable de gérer une variété de formats de date", () => {
      // Note: parseDate는 private 메서드이므로 간접 테스트
      // ISO 8601, RFC 2822, timestamp 등 다양한 형식 지원

      //todo
    });
  });
});
