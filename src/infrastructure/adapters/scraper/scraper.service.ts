/**
 * @author Dongwoo
 * @date 2025-10-13
 * Hacker News 스크래퍼 구현 - IScraperPort 구현체
 */
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  IScraperPort,
  ScrapedArticle,
  ScrapeResult,
} from '../../../application/ports/out/scraper.port';
import { HttpClient } from '../web/http-client.util';
import {SourceDomain} from "../../../domain/entities/source.domain";

/**
 * Hacker News 스크래퍼
 * https://news.ycombinator.com/ 에서 기사 정보를 수집
 */
@Injectable()
export class Scraper implements IScraperPort {
  private readonly logger = new Logger(Scraper.name);
  private readonly httpClient: HttpClient;
  private readonly baseUrl = 'https://news.ycombinator.com';

  constructor() {
    this.httpClient = new HttpClient({
      timeout: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      rateLimitMs: 1000,
      userAgent: 'Mozilla/5.0 (compatible; NewsBot/1.0)',
    });
  }

  /**
   * Hacker News에서 기사 목록을 스크래핑
   * @param source 소스 URL
   * @returns 스크래핑 결과
   */
  async scrapeArticles (source: SourceDomain): Promise<ScrapeResult> {
    const scrapedAt = new Date();

    try {
      this.logger.log(`Starting scrape for ${source}`);

      // HTML 가져오기
      const html = await this.httpClient.get<string>(source.targetUrl);

      // Cheerio로 HTML 파싱
      const $ = cheerio.load(html);

      const articles: ScrapedArticle[] = [];
      const processedUrls = new Set<string>();

      /*
      *
      * */
      // .athing 셀렉터로 기사 목록 추출
      $('.athing').each((index, element) => {
        try {
          const $element = $(element);
          const $titleLine = $element.find('.titleline > a');

          // 제목과 URL 추출
          const title = $titleLine.text().trim();
          const url = $titleLine.attr('href');

          if (!title || !url) {
            return; // continue
          }

          // 상대 URL을 절대 URL로 변환
          const absoluteUrl = this.normalizeUrl(url);

          // 중복 URL 체크
          if (processedUrls.has(absoluteUrl)) {
            return; // continue
          }
          processedUrls.add(absoluteUrl);

          // 다음 행(subtext)에서 메타데이터 추출
          const $subtext = $element.next('.athing').length > 0
            ? $element.next()
            : $element.nextAll('.athing').first();

          // 날짜 정보 추출 (.age 속성)
          const $age = $subtext.find('.age');
          const publicationDate = this.parseAge($age.attr('title') || '');

          articles.push({
            title,
            url: absoluteUrl,
            publicationDate: publicationDate || undefined,
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(`Failed to parse article at index ${index}: ${errorMessage}`);
          return; // each() 콜백에서는 continue 대신 return 사용
        }
      });

      this.logger.log(`Successfully scraped ${articles.length} articles from ${source}`);

      return {
        sourceId,
        articles,
        success: true,
        scrapedAt,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to scrape ${source}: ${errorMessage}`);
      return {
        success: false,
        sourceId,
        articles: [],
        scrapedAt,
        error: errorMessage,
      };
    }
  }

  /**
   * 스크래핑 가능 여부 확인
   * @param url 확인할 URL
   * @returns 스크래핑 가능 여부
   */
  async canScrape(url: string): Promise<boolean> {
    try {
      // HTTP 요청으로 URL 유효성 확인
      const response = await this.httpClient.get(url);
      return response !== undefined;
    } catch (error) {
      this.logger.warn(`Error checking URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * URL을 절대 URL로 정규화
   * @param url 원본 URL
   * @returns 정규화된 URL
   */
  private normalizeUrl(url: string): string {
    try {
      // 이미 절대 URL인 경우
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }

      // 상대 URL인 경우 baseUrl과 결합
      if (url.startsWith('/')) {
        return `${this.baseUrl}${url}`;
      }

      return `${this.baseUrl}/${url}`;
    } catch {
      return url;
    }
  }

  /**
   * "age" 속성에서 날짜 파싱
   * @param ageTitle age 속성 값 (예: "2024-01-13T10:30:00")
   * @returns 파싱된 날짜 또는 null
   */
  private parseAge(ageTitle: string): Date | null {
    try {
      if (!ageTitle) return null;

      const date = new Date(ageTitle);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }
}
