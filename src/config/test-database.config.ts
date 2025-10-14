/**
 * @author Devonshin
 * @date 2025-01-13
 * 테스트용 데이터베이스 설정
 */
import {SequelizeModuleOptions} from '@nestjs/sequelize';

/**
 * 통합 테스트용 데이터베이스 설정
 * 실제 DB 연결을 사용하되, 테스트 환경에 맞게 최적화
 */
export const getTestDatabaseConfig = (): SequelizeModuleOptions => ({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'font_ninja',
  password: process.env.DB_PASSWORD || 'fontninja@password',
  database: process.env.DB_DATABASE || 'font_ninja_scrapping_db',
  autoLoadModels: true,
  synchronize: false, // 테스트에서는 기존 스키마 사용
  logging: false, // 테스트 시 로깅 비활성화
  timezone: '+09:00',
  pool: {
    max: 5, // 테스트용으로 pool 크기 축소
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
