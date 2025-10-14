'use strict';

/**
 * @author Devonshin
 * @date 2025-01-13
 * sources_tags 테이블 생성 마이그레이션
 * - 동적 스크래핑을 위한 타겟 필드별 태그/클래스명 관리
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sources_tags', {
      // 기본 키 (BIGINT AUTO_INCREMENT)
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '기본 키',
      },

      // 소스 ID (UUID, sources 테이블 참조)
      source_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sources',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: '소스 ID (sources 테이블 참조)',
      },

      // 필드 명 (타겟 대상 이름)
      field_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '타겟 대상 이름 (예: title, summary, date, link)',
      },

      // 태그 명
      tag_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '타겟 대상 HTML 태그명 (예: h1, div, span)',
      },

      // 클래스 명 (NULLABLE)
      class_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '타겟 대상 CSS 클래스명',
      },

      // 생성 시각
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '레코드 생성 시각',
      },
    });

    // 복합 인덱스 생성 (source_id + field_name)
    await queryInterface.addIndex('sources_tags', ['source_id', 'field_name'], {
      name: 'idx_sources_tags_source_field',
      comment: '소스별 필드 조회 최적화',
    });

    // source_id 단독 인덱스
    await queryInterface.addIndex('sources_tags', ['source_id'], {
      name: 'idx_sources_tags_source_id',
      comment: '소스별 조회 최적화',
    });
  },

  async down(queryInterface, Sequelize) {
    // 인덱스 삭제
    await queryInterface.removeIndex('sources_tags', 'idx_sources_tags_source_id');
    await queryInterface.removeIndex('sources_tags', 'idx_sources_tags_source_field');

    // 테이블 삭제
    await queryInterface.dropTable('sources_tags');
  },
};
