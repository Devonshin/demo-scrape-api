/**
 * @author Dongwoo
 * @date 2025-10-13
 * Schéma de validation des variables d'environnement - Validation du type et de la valeur des variables d'environnement à l'aide du class-validator
 */
import {plainToInstance} from 'class-transformer';
import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString, validateSync} from 'class-validator';

/**
 * Les énumérations qui définissent l'environnement d'exécution de l'application
 */
export enum Environment {
  Local = 'local',
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Classes pour la validation des variables d'environnement
 * Toutes les variables d'environnement requises doivent être définies dans cette classe et sont validées au démarrage de l'application.
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

  @IsNumber()
  DB_POOL_MAX!: number;

  @IsNumber()
  DB_POOL_MIN!: number;

  @IsNumber()
  DB_POOL_ACQUIRE!: number;

  @IsNumber()
  DB_POOL_IDLE!: number;

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
 * Fonctions de validation des variables d'environnement
 * @param config - Objet de la variable d'environnement à valider
 * @returns Objets variables d'environnement validés
 * @throws Error Lance une erreur si une variable d'environnement n'est pas valide
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
