/**
 * @author Dongwoo
 * @date 2025-10-13
 * Sequelize 설정 파일 (JavaScript) - 마이그레이션과 시딩을 위한 설정
 */
const dotenv = require('dotenv');
const path = require('path');

/**
 * 환경변수 로드
 * NODE_ENV에 따라 적절한 .env 파일 로드
 */
const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'local'}`);
dotenv.config({ path: envPath });

/**
 * Sequelize CLI 설정
 * 데이터베이스 연결 파라미터 (마이그레이션과 시딩에 사용)
 */
module.exports = {
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
