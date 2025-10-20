/**
 * @author Dongwoo
 * @date 2025-10-13
 */
import {Module} from '@nestjs/common';
import {PersistenceModule} from '../infrastructure/adapters/repositories/persistence.module';
import {ScraperModule} from '../infrastructure/adapters/scraper/scraper.module';
import {ScrapeArticlesUseCase} from './use-cases/scrape-articles.use-case';
import {GetArticlesUseCase} from './use-cases/get-articles.use-case';

/**
 * Application Module
 * - Enregistrement d'une implémentation de Use Case
 */
@Module({
  imports: [
    PersistenceModule,
    ScraperModule,
  ],
  providers: [
    {
      provide: 'ScrapeArticlesPort',
      useClass: ScrapeArticlesUseCase,
    },
    {
      provide: 'GetArticlesPort',
      useClass: GetArticlesUseCase,
    },
  ],
  exports: [
    'ScrapeArticlesPort',
    'GetArticlesPort',
  ],
})
export class ApplicationModule {}
