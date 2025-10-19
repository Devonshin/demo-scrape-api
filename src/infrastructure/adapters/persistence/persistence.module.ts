/**
 * @author Dongwoo
 * @date 2025-10-13
 * Persistence Module - Repository 등록 및 의존성 주입 설정
 */
import {Module} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {ArticleRepositoryImpl} from './article.repository.impl';
import {SourceRepositoryImpl} from './source.repository.impl';
import {TransactionService} from '../../services/transaction.service';
import {SourceTagRepositoryImpl} from "./source-tag.repository.impl";
import {Article, ArticleIndex, Source, SourceTag} from "../../../entities/entity.module";

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
      provide: 'IArticleRepository',
      useClass: ArticleRepositoryImpl,
    },
    // Source Repository
    {
      provide: 'ISourceRepository',
      useClass: SourceRepositoryImpl,
    },
    // SourceTag Repository
    {
      provide: 'ISourceTagRepository',
      useClass: SourceTagRepositoryImpl,
    },
    // Transaction Service
    TransactionService,
  ],
  exports: [
    'IArticleRepository',
    'ISourceRepository',
    'ISourceTagRepository',
    TransactionService,
  ],
})
export class PersistenceModule {
}
