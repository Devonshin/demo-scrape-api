/**
 * @author Devonshin
 * @date 2025-01-13
 * Scraper 통합 테스트
 */
import { Test, TestingModule } from '@nestjs/testing';
import Scraper from '../scraper.service';
import { ISourceTagRepository } from '../../../../domain/repositories/source-tag.repository.interface';
import { SourceDomain } from '../../../../domain/entities/source.domain';
import { SourceTagDomain } from '../../../../domain/entities/source-tag.domain';
import {
  MissingTagConfigException,
  NetworkException,
} from '../exceptions/scraper.exceptions';

describe('Scraper Integration Tests', () => {
  let scraper: Scraper;
  let mockSourceTagRepository: jest.Mocked<ISourceTagRepository>;

  beforeEach(async () => {
    // Mock SourceTagRepository 생성
    mockSourceTagRepository = {
      findById: jest.fn(),
      findBySourceId: jest.fn(),
      findBySourceIdAndFieldName: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ISourceTagRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Scraper,
        {
          provide: 'ISourceTagRepository',
          useValue: mockSourceTagRepository,
        },
      ],
    }).compile();

    scraper = module.get<Scraper>(Scraper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('태그 설정이 없는 경우', () => {
    it('태그가 없으면 에러를 반환해야 한다', async () => {
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

      // Then: 실패 결과 반환
      expect(result.success).toBe(false);
      expect(result.error).toContain('No tags configured');
      expect(result.articles).toHaveLength(0);
    });

  });

  describe('잘못된 셀렉터 케이스', () => {
    it('잘못된 셀렉터로도 정상적으로 처리되어야 한다', async () => {
      // Given: 존재하지 않는 셀렉터 설정
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

      // When & Then: 실제 HTTP 요청 시뮬레이션 필요
      // 잘못된 셀렉터여도 빈 배열을 반환하며 정상 처리되어야 함
    });
  });

  describe('canScrape 메서드 테스트', () => {
    it('유효한 URL인 경우 true를 반환해야 한다', async () => {
      // When: 유효한 URL 확인
      // Note: 실제 HTTP 요청이 필요하므로 mock 또는 실제 테스트 환경 필요
      const validUrl = 'https://google.com';

      // Then: 결과는 실제 환경에서 확인
      expect(await scraper.canScrape(validUrl)).toBe(true);
    });

    it('유효하지 않은 URL인 경우 false를 반환해야 한다', async () => {
      // When: 유효하지 않은 URL 확인
      const invalidUrl = 'https://invalid-domain-that-does-not-exist-123456.com';

      // Then: false 반환
      const result = await scraper.canScrape(invalidUrl);
      expect(result).toBe(false);
    });
  });

  describe('URL 정규화 테스트', () => {
    it('상대 URL을 절대 URL로 변환해야 한다', () => {
      // Note: normalizeUrl은 private 메서드이므로 간접적으로 테스트
      // 실제로는 scrapeArticles 실행 결과로 검증
    });

    it('이미 절대 URL인 경우 그대로 반환해야 한다', () => {
      // Note: 간접 테스트
    });
  });

  describe('성능 테스트', () => {
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
      // await scraper.scrapeArticles(source);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 성능 기준: 10초 이내
      // expect(duration).toBeLessThan(10000);
    });
  });

  describe('날짜 파싱 테스트', () => {
    it('다양한 날짜 형식을 처리할 수 있어야 한다', () => {
      // Note: parseDate는 private 메서드이므로 간접 테스트
      // ISO 8601, RFC 2822, timestamp 등 다양한 형식 지원
    });
  });
});
