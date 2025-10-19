/**
 * @author Dongwoo
 * @date 2025-10-13
 * Module Base de Données - configuration de la connexion Sequelize et enregistrement des entités
 */
import {Module} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {Article, ArticleIndex, Source, SourceTag} from '../entities/entity.module';

/**
 * Module de base de données
 * Connexion MySQL via Sequelize ORM et gestion des entités
 */
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Type de base de données (MySQL)
        dialect: 'mysql',
        // Hôte de la base de données
        host: configService.get<string>('DB_HOST'),
        // Port de la base de données
        port: configService.get<number>('DB_PORT'),
        // Nom d'utilisateur de la base de données
        username: configService.get<string>('DB_USERNAME'),
        // Mot de passe de la base de données
        password: configService.get<string>('DB_PASSWORD'),
        // Nom de la base de données
        database: configService.get<string>('DB_DATABASE'),
        // Liste des entités à enregistrer
        models: [Source, SourceTag, Article, ArticleIndex],
        // Synchronisation automatique des tables (à utiliser uniquement en développement, migrations en production)
        autoLoadModels: true,
        // Options de synchronisation (modifier : modifier une table existante, forcer : supprimer et recréer)
        sync: configService.get<string>('NODE_ENV') !== 'production' ? { alter: true } : undefined,
        // Configuration du logging (activé uniquement en local)
        logging: configService.get<string>('NODE_ENV') === 'local' ? console.log : false,
        // Configuration du pool
        pool: {
          max: configService.get<number>('DB_POOL_MAX'),
          min: configService.get<number>('DB_POOL_MIN'),
          acquire: configService.get<number>('DB_POOL_ACQUIRE'),
          idle: configService.get<number>('DB_POOL_IDLE'),
        },
        // Fuseau horaire (UTC)
        timezone: '+00:00',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
