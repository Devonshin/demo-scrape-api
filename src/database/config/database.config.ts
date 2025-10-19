/**
 * @author Dongwoo
 * @date 2025-10-13
 * Fichier de configuration Sequelize - paramètres pour les migrations et le seeding
 */
import {SequelizeOptions} from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Chargement des variables d'environnement
 * Charge le fichier .env approprié selon NODE_ENV
 */
const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'local'}`);
dotenv.config({ path: envPath });

/**
 * Configuration pour Sequelize CLI
 * Paramètres de connexion à la base de données utilisés pour les migrations et le seeding
 */
const config: SequelizeOptions = {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'font_ninja_scrapping_db',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  timezone: '+00:00',
  define: {
    underscored: true,
    timestamps: true,
  },
};

export default config;
