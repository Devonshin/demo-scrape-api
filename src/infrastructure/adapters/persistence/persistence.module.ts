/**
 * @author Dongwoo
 * @date 2025-10-13
 * Persistence Module - Repository 등록 및 의존성 주입 설정
 */
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Article } from '../../../entities/article.entity';
import { ArticleIndex } from '../../../entities/article-index.entity';
import { Source } from '../../../entities/source.entity';
import { ArticleRepositoryImpl } from './article.repository.impl';
import { SourceRepositoryImpl } from './source.repository.impl';
import { TransactionService } from '../../services/transaction.service';

/**
 * Persistence Module
 * - Sequelize 모델 등록
 * - Repository 구현체 제공
 * - 의존성 주입을 위한 토큰 설정
 */
@Module({
  imports: [
    SequelizeModule.forFeature([
      Article,
      ArticleIndex,
      Source,
    ]),
  ],
  providers: [
    // Article Repository
    {
      provide: 'IArticleRepository',
      useClass: ArticleRepositoryImpl,
    },
    // Source Repository
    {
      provide: 'ISourceRepository',
      useClass: SourceRepositoryImpl,
    },
    // Transaction Service
    TransactionService,
  ],
  exports: [
    'IArticleRepository',
    'ISourceRepository',
    TransactionService,
  ],
})
export class PersistenceModule {}
