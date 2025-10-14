/**
 * @author Dongwoo
 * @date 2025-10-13
 * 애플리케이션 루트 모듈 - 모든 모듈의 진입점
 */
import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {validate} from './config';
import {HealthModule} from './health/health.module';
import {DatabaseModule} from './database/database.module';
import {PresentationModule} from './presentation/presentation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      validate,
    }),
    DatabaseModule,
    HealthModule,
    PresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
