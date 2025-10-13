/**
 * @author Dongwoo
 * @date 2025-10-13
 * 데이터베이스 설정 - Sequelize ORM 연결을 위한 설정
 */
import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

/**
 * Sequelize 데이터베이스 설정을 생성하는 팩토리 함수
 * @param configService - NestJS ConfigService 인스턴스
 * @returns Sequelize 모듈 설정 객체
 */
export const getDatabaseConfig = (configService: ConfigService): SequelizeModuleOptions => ({
  dialect: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  autoLoadModels: true,
  synchronize: configService.get<boolean>('DB_SYNC', false),
  logging: configService.get<boolean>('DB_LOGGING', false),
  timezone: '+09:00', // 한국 시간대
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
