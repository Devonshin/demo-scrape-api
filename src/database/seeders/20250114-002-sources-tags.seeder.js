/**
 * @author Devonshin
 * @date 2025-01-14
 * SourcesTags 테이블 초기 데이터 시더
 */
'use strict';

/**
 * SourcesTags 초기 데이터
 * BBC News와 Hacker News의 스크래핑 타겟 필드 정의
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bbcSourceId = Buffer.from('72BDC8C6CD434E41BD7912A13E16C8B7', 'hex');
    const hackerNewsSourceId = Buffer.from('BFE2872E0B3145528ED8FBA41BCA6CFD', 'hex');

    const sourcesTags = [
      // BBC News 타겟 필드들
      {
        id: 15,
        source_id: bbcSourceId,
        field_name: 'title',
        tag_name: 'h2',
        class_name: '[data-testid="card-headline"]',
        created_at: new Date('2025-10-13 00:00:00'),
      },
      {
        id: 16,
        source_id: bbcSourceId,
        field_name: 'link',
        tag_name: '',
        class_name: '',
        created_at: new Date('2025-10-13 00:00:00'),
      },
      {
        id: 17,
        source_id: bbcSourceId,
        field_name: 'publication_date',
        tag_name: 'span',
        class_name: '[data-testid="card-metadata-lastupdated"]',
        created_at: new Date('2025-10-13 00:00:00'),
      },
      {
        id: 18,
        source_id: bbcSourceId,
        field_name: 'summary',
        tag_name: 'p',
        class_name: '[data-testid="card-description"]',
        created_at: new Date('2025-10-13 00:00:00'),
      },
      // Hacker News 타겟 필드들
      {
        id: 19,
        source_id: hackerNewsSourceId,
        field_name: 'title',
        tag_name: 'span',
        class_name: '.titleline',
        created_at: new Date('2025-10-13 00:00:00'),
      },
      {
        id: 20,
        source_id: hackerNewsSourceId,
        field_name: 'link',
        tag_name: 'span',
        class_name: '.titleline > a',
        created_at: new Date('2025-10-13 00:00:00'),
      },
      {
        id: 21,
        source_id: hackerNewsSourceId,
        field_name: 'publication_date',
        tag_name: '__NEXT__span',
        class_name: '.age',
        created_at: new Date('2025-10-13 00:00:00'),
      },
      {
        id: 22,
        source_id: hackerNewsSourceId,
        field_name: 'summary',
        tag_name: '',
        class_name: '',
        created_at: new Date('2025-10-13 00:00:00'),
      },
    ];

    await queryInterface.bulkInsert('sources_tags', sourcesTags, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sources_tags', null, {});
  },
};
