/**
 * @author Dongwoo
 * @date 2025-10-13
 * Persistence Module - Repository 등록 및 의존성 주입 설정
 */
import {Module} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {ArticleRepositoryAdapter} from './article-repository-adapter.service';
import {SourceRepositoryAdapter} from './source.repository.adapter';
import {TransactionService} from '../../services/transaction.service';
import {SourceTagRepositoryAdapter} from "./source-tag.repository.adapter";
import {Article, ArticleIndex, Source, SourceTag} from "../../entities/entity.module";

/**
 * Persistence Module
 * - Sequelize Enregistrement des modèles
 * - Repository Fournir une mise en œuvre
 * - Mise en place de jetons pour l'injection de dépendances
 */
@Module({
  imports: [
    SequelizeModule.forFeature([
      Article,
      ArticleIndex,
      Source,
      SourceTag,
    ]),
  ],
  providers: [
    // Article Repository
    {
      provide: 'ArticleRepositoryPort',
      useClass: ArticleRepositoryAdapter,
    },
    // Source Repository
    {
      provide: 'SourceRepositoryPort',
      useClass: SourceRepositoryAdapter,
    },
    // SourceTag Repository
    {
      provide: 'SourceTagRepositoryPort',
      useClass: SourceTagRepositoryAdapter,
    },
    // Transaction Service
    TransactionService,
  ],
  exports: [
    'ArticleRepositoryPort',
    'SourceRepositoryPort',
    'SourceTagRepositoryPort',
    TransactionService,
  ],
})
export class PersistenceModule {
}
