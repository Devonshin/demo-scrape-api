/**
 * @author Dongwoo
 * @date 2025-10-13
 * Point d’entrée principal de l’application - bootstrap de l’application Nest.js
 */
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {HttpExceptionFilter} from "./common/filters/http-exception.filter";
import {TransformInterceptor} from "./common/interceptors/transform.interceptor";
import {LoggingInterceptor} from "./common/interceptors/logging.interceptor";

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuration CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 전역 파이프 설정 (유효성 검증 및 변환)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 요청 거부
      transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
      transformOptions: {
        enableImplicitConversion: true, // 암시적 타입 변환 활성화
      },
    }),
  );

  // 전역 필터 설정 (예외 처리)
  app.useGlobalFilters(new HttpExceptionFilter());

  // 전역 인터셉터 설정 (로깅 및 응답 변환)
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('Scraper API')
    .setDescription('스크래핑 및 관리 API 문서')
    .setVersion('1.0')
    // .addTag('articles', '기사 관리')
    // .addTag('sources', '소스 관리')
    // .addTag('scraper', '스크래핑 작업 관리')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 애플리케이션 시작
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
}
bootstrap();
