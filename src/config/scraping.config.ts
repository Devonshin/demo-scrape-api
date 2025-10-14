/**
 * @author Dongwoo
 * @date 2025-10-13
 * Configuration de scraping - paramètres pour contrôler le comportement de web scraping
 */
import {ConfigService} from '@nestjs/config';

/**
 * Interface de configuration du scraping
 */
export interface ScrapingConfig {
  /** Intervalle d'exécution du scraping (millisecondes) */
  interval: number;
  /** Nombre maximal de tentatives de nouvelle tentative */
  maxRetryAttempts: number;
  /** Délai entre les tentatives (millisecondes) */
  retryDelay: number;
}

/**
 * Fonction pour obtenir la configuration de scraping
 * @param configService - instance NestJS ConfigService
 * @returns objet de configuration de scraping
 */
export const getScrapingConfig = (configService: ConfigService): ScrapingConfig => ({
  interval: configService.get<number>('SCRAPING_INTERVAL', 300000), // Valeur par défaut : 5 minutes
  maxRetryAttempts: configService.get<number>('MAX_RETRY_ATTEMPTS', 3),
  retryDelay: configService.get<number>('RETRY_DELAY', 1000), // Valeur par défaut : 1 seconde
});
