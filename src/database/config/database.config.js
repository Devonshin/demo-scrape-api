"use strict";
var dotenv = require("dotenv");
var path = require("path");
/**
 * Chargement des variables d'environnement
 * Charge le fichier .env approprié selon NODE_ENV
 */
var envPath = path.resolve(process.cwd(), ".env.".concat(process.env.NODE_ENV || 'local'));
dotenv.config({ path: envPath });
/**
 * Configuration pour Sequelize CLI
 * Paramètres de connexion à la base de données utilisés pour les migrations et le seeding
 */
var config = {
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

// Export pour Sequelize CLI (doit être module.exports directement)
module.exports = config;

// Export pour TypeScript/NestJS
module.exports.default = config;
