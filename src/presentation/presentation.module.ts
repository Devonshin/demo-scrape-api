/**
 * @author Dongwoo
 * @date 2025-10-13
 * Presentation Module - Controller 등록
 */
import {Module} from '@nestjs/common';
import {ApplicationModule} from '../application/application.module';
import {ArticleController} from './controllers/article.controller';

/**
 * Presentation Module
 * - API Controllers 등록
 * - Application Module import
 */
@Module({
  imports: [
    ApplicationModule,
  ],
  controllers: [
    ArticleController
  ],
})
export class PresentationModule {}
