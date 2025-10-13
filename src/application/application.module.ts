/**
 * @author Dongwoo
 * @date 2025-10-13
 * Application Module - Use Case 등록 및 의존성 주입 설정
 */
import { Module } from '@nestjs/common';
import { PersistenceModule } from '../infrastructure/adapters/persistence/persistence.module';
import { ScraperModule } from '../infrastructure/adapters/scraper/scraper.module';
import { ScrapeArticlesUseCaseImpl } from './use-cases/scrape-articles.use-case.impl';
import { GetArticlesUseCaseImpl } from './use-cases/get-articles.use-case.impl';

/**
 * Application Module
 * - Use Case 구현체 등록
 * - Infrastructure 모듈 import
 */
@Module({
  imports: [
    PersistenceModule,
    ScraperModule,
  ],
  providers: [
    {
      provide: 'IScrapeArticlesUseCase',
      useClass: ScrapeArticlesUseCaseImpl,
    },
    {
      provide: 'IGetArticlesUseCase',
      useClass: GetArticlesUseCaseImpl,
    },
  ],
  exports: [
    'IScrapeArticlesUseCase',
    'IGetArticlesUseCase',
  ],
})
export class ApplicationModule {}
