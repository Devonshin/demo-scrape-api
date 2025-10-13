/**
 * @author Dongwoo
 * @date 2025-10-13
 * 환경 변수 검증 스키마 - class-validator를 사용하여 환경 변수의 타입과 값을 검증
 */
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsBoolean, IsOptional } from 'class-validator';

/**
 * 애플리케이션 실행 환경을 정의하는 열거형
 */
export enum Environment {
  Local = 'local',
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * 환경 변수 검증을 위한 클래스
 * 모든 필수 환경 변수는 이 클래스에 정의되어야 하며, 애플리케이션 시작 시 검증됩니다.
 */
export class EnvironmentVariables {
  // Application Configuration
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsNumber()
  PORT!: number;

  // Database Configuration
  @IsString()
  DB_HOST!: string;

  @IsNumber()
  DB_PORT!: number;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_DATABASE!: string;

  @IsBoolean()
  @IsOptional()
  DB_SYNC?: boolean;

  @IsBoolean()
  @IsOptional()
  DB_LOGGING?: boolean;

  // Scraping Configuration
  @IsNumber()
  @IsOptional()
  SCRAPING_INTERVAL?: number;

  @IsNumber()
  @IsOptional()
  MAX_RETRY_ATTEMPTS?: number;

  @IsNumber()
  @IsOptional()
  RETRY_DELAY?: number;
}

/**
 * 환경 변수를 검증하는 함수
 * @param config - 검증할 환경 변수 객체
 * @returns 검증된 환경 변수 객체
 * @throws 환경 변수가 유효하지 않을 경우 에러 발생
 */
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
