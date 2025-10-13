/**
 * @author Dongwoo
 * @date 2025-10-13
 * Contrôleur de test de configuration - exemple d'utilisation de ConfigService
 */
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAppConfig, getDatabaseConfig, getScrapingConfig } from './index';

/**
 * Contrôleur pour consulter les informations de configuration
 * Utilisé en environnement de développement pour vérifier les paramètres
 */
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Récupérer la configuration de l'application
   * @returns informations de configuration de l'app
   */
  @Get('app')
  getAppConfig() {
    return getAppConfig(this.configService);
  }

  /**
   * Récupérer la configuration de la base de données (sans mot de passe)
   * @returns informations de configuration DB (mot de passe masqué)
   */
  @Get('database')
  getDatabaseConfig() {
    const config = getDatabaseConfig(this.configService);
    return {
      ...config,
      password: '***', // Masquage du mot de passe
    };
  }

  /**
   * Consulter la configuration de scraping
   * @returns Informations de configuration de scraping
   */
  @Get('scraping')
  getScrapingConfig() {
    return getScrapingConfig(this.configService);
  }

  /**
   * Consulter toutes les variables d’environnement (développement)
   * @returns Toutes les informations de configuration
   */
  @Get('all')
  getAllConfig() {
    return {
      app: this.getAppConfig(),
      database: this.getDatabaseConfig(),
      scraping: this.getScrapingConfig(),
    };
  }
}
