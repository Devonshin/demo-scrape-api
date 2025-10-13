/**
 * @author Dongwoo
 * @date 2025-10-13
 * Configuration de l'application - gestion des paramètres globaux de l'app
 */
import { ConfigService } from '@nestjs/config';
import { Environment } from './env.validation';

/**
 * Interface de configuration de l'application
 */
export interface AppConfig {
  /** Environnement d'exécution de l'application */
  environment: Environment;
  /** Numéro de port de l'application */
  port: number;
  /** Indique si l'environnement est en production */
  isProduction: boolean;
  /** Indique si l'environnement est en développement */
  isDevelopment: boolean;
  /** Indique si l'environnement est local */
  isLocal: boolean;
  /** Indique si l'environnement est de test */
  isTest: boolean;
}

/**
 * 애플리케이션 설정을 가져오는 함수
 * @param configService - NestJS ConfigService 인스턴스
 * @returns 애플리케이션 설정 객체
 */
export const getAppConfig = (configService: ConfigService): AppConfig => {
  const environment = configService.get<Environment>('NODE_ENV', Environment.Local);

  return {
    environment,
    port: configService.get<number>('PORT', 3000),
    isProduction: environment === Environment.Production,
    isDevelopment: environment === Environment.Development,
    isLocal: environment === Environment.Local,
    isTest: environment === Environment.Test,
  };
};
