/**
 * @author Devonshin
 * @date 2025-01-13
 */
import {SequelizeModuleOptions} from '@nestjs/sequelize';

/**
 * Mise en place d'une base de données pour les tests d'intégration
 * Utiliser une véritable connexion à la base de données, mais la configurer comme un environnement de test.
 */
export const getTestDatabaseConfig = (): SequelizeModuleOptions => ({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'font_ninja',
  password: process.env.DB_PASSWORD || 'fontninja@password',
  database: process.env.DB_DATABASE || 'font_ninja_scrapping_db',
  autoLoadModels: true,
  synchronize: false, // Utiliser le schéma existant pour les tests
  logging: false, // Désactiver la journalisation lors des tests
  timezone: '+00:00',
  pool: {
    max: +process.env.DB_POOL_MAX! || 5,
    min: +process.env.DB_POOL_MIN! || 0,
    acquire: +process.env.DB_POOL_ACQUIRE! || 300000,
    idle: +process.env.DB_POOL_IDLE! || 10000,
  },
});
