/**
 * @author Devonshin
 * @date 2025-01-13
 * UUID 타입을 CHAR(36)에서 BINARY(16)로 변경하는 마이그레이션
 *
 * 주의사항:
 * - 기존 데이터가 있는 경우 데이터 손실이 발생할 수 있습니다.
 * - 프로덕션 환경에서는 데이터 백업 후 실행하세요.
 * - UUID 문자열을 BINARY로 변환하는 함수를 사용합니다.
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Starting UUID to BINARY migration...');

      // 1. 외래 키 제약조건 제거
      console.log('Step 1: Removing foreign key constraints...');

      // articles 테이블의 source_id 외래 키
      await queryInterface.removeConstraint('articles', 'articles_ibfk_1', { transaction });

      // article_indexes 테이블의 article_id 외래 키
      await queryInterface.removeConstraint('article_indexes', 'article_indexes_ibfk_1', { transaction });

      // sources_tags 테이블의 source_id 외래 키
      await queryInterface.removeConstraint('sources_tags', 'sources_tags_ibfk_1', { transaction });

      // 2. sources 테이블 - id 컬럼 변경
      console.log('Step 2: Converting sources.id to BINARY(16)...');
      await queryInterface.sequelize.query(`
        ALTER TABLE sources
        MODIFY COLUMN id BINARY(16) NOT NULL;
      `, { transaction });

      // 3. articles 테이블 - id, source_id 컬럼 변경
      console.log('Step 3: Converting articles columns to BINARY(16)...');
      await queryInterface.sequelize.query(`
        ALTER TABLE articles
        MODIFY COLUMN id BINARY(16) NOT NULL,
        MODIFY COLUMN source_id BINARY(16) NOT NULL;
      `, { transaction });

      // 4. article_indexes 테이블 - article_id 컬럼 변경
      console.log('Step 4: Converting article_indexes.article_id to BINARY(16)...');
      await queryInterface.sequelize.query(`
        ALTER TABLE article_indexes
        MODIFY COLUMN article_id BINARY(16) NOT NULL;
      `, { transaction });

      // 5. sources_tags 테이블 - source_id 컬럼 변경
      console.log('Step 5: Converting sources_tags.source_id to BINARY(16)...');
      await queryInterface.sequelize.query(`
        ALTER TABLE sources_tags
          MODIFY COLUMN source_id BINARY (16) NOT NULL;
      `, { transaction });

      // 6. 외래 키 제약조건 재생성
      console.log('Step 6: Re-creating foreign key constraints...');

      // articles.source_id -> sources.id
      await queryInterface.addConstraint('articles', {
        fields: ['source_id'],
        type: 'foreign key',
        name: 'articles_ibfk_1',
        references: {
          table: 'sources',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction,
      });

      // article_indexes.article_id -> articles.id
      await queryInterface.addConstraint('article_indexes', {
        fields: ['article_id'],
        type: 'foreign key',
        name: 'article_indexes_ibfk_1',
        references: {
          table: 'articles',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction,
      });

      // sources_tags.source_id -> sources.id
      await queryInterface.addConstraint('sources_tags', {
        fields: ['source_id'],
        type: 'foreign key',
        name: 'sources_tags_ibfk_1',
        references: {
          table: 'sources',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction,
      });

      await transaction.commit();
      console.log('Migration completed successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Rolling back UUID to BINARY migration...');

      // 1. 외래 키 제약조건 제거
      console.log('Step 1: Removing foreign key constraints...');
      await queryInterface.removeConstraint('articles', 'articles_ibfk_1', { transaction });
      await queryInterface.removeConstraint('article_indexes', 'article_indexes_ibfk_1', { transaction });
      await queryInterface.removeConstraint('sources_tags', 'sources_tags_ibfk_1', { transaction });

      // 2. BINARY(16)를 CHAR(36)로 되돌리기
      console.log('Step 2: Converting back to CHAR(36)...');

      await queryInterface.sequelize.query(`
        ALTER TABLE sources
        MODIFY COLUMN id CHAR(36) NOT NULL;
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE articles
        MODIFY COLUMN id CHAR(36) NOT NULL,
        MODIFY COLUMN source_id CHAR(36) NOT NULL;
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE article_indexes
        MODIFY COLUMN article_id CHAR(36) NOT NULL;
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE sources_tags
        MODIFY COLUMN source_id CHAR(36) NOT NULL;
      `, { transaction });

      // 3. 외래 키 제약조건 재생성
      console.log('Step 3: Re-creating foreign key constraints...');

      await queryInterface.addConstraint('articles', {
        fields: ['source_id'],
        type: 'foreign key',
        name: 'articles_ibfk_1',
        references: {
          table: 'sources',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction,
      });

      await queryInterface.addConstraint('article_indexes', {
        fields: ['article_id'],
        type: 'foreign key',
        name: 'article_indexes_ibfk_1',
        references: {
          table: 'articles',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction,
      });

      await queryInterface.addConstraint('sources_tags', {
        fields: ['source_id'],
        type: 'foreign key',
        name: 'sources_tags_ibfk_1',
        references: {
          table: 'sources',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction,
      });

      await transaction.commit();
      console.log('Rollback completed successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Rollback failed:', error);
      throw error;
    }
  }
};
