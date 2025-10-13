/**
 * @author Dongwoo
 * @date 2025-10-13
 * 스크래퍼 모듈 - 스크래퍼 서비스들을 제공하는 모듈
 */
import { Module } from '@nestjs/common';
import { Scraper } from './scraper.service';

/**
 * 스크래퍼 모듈
 * 다양한 뉴스 소스에 대한 스크래퍼 제공
 */
@Module({
  providers: [
    {
      provide: 'IScraperPort',
      useClass: Scraper,
    },
    Scraper,
  ],
  exports: ['IScraperPort', Scraper],
})
export class ScraperModule {}
