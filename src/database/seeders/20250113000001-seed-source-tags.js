/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag 시드 데이터 - Hacker News 스크래핑 태그 설정
 */

/**
 * Hacker News 스크래핑을 위한 태그 설정 시더
 * 
 * 설정되는 필드:
 * - title: 기사 제목 (a.titleline)
 * - link: 기사 링크 (a.titleline)
 * - publicationDate: 게시 날짜 (span.age)
 */
module.exports = {
  /**
   * 시드 데이터 생성
   * @param {import('sequelize').QueryInterface} queryInterface - Sequelize QueryInterface
   */
  async up(queryInterface) {
    const now = new Date();

    // Hacker News source의 ID 조회
    const sources = await queryInterface.sequelize.query(
      `SELECT id FROM sources WHERE title = 'Hacker News' LIMIT 1;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (sources.length === 0) {
      console.warn('Hacker News source를 찾을 수 없습니다. 먼저 sources 시드를 실행하세요.');
      return;
    }

    const hackerNewsSourceId = sources[0].id;

    // sources_tags 테이블에 Hacker News 스크래핑 설정 추가
    await queryInterface.bulkInsert('sources_tags', [
      {
        source_id: hackerNewsSourceId,
        field_name: 'title',
        tag_name: 'a',
        class_name: 'titleline',
        created_at: now,
      },
      {
        source_id: hackerNewsSourceId,
        field_name: 'link',
        tag_name: 'a',
        class_name: 'titleline',
        created_at: now,
      },
      {
        source_id: hackerNewsSourceId,
        field_name: 'publicationDate',
        tag_name: 'span',
        class_name: 'age',
        created_at: now,
      },
    ]);

    console.log('✅ Hacker News 스크래핑 태그 설정이 완료되었습니다.');
  },

  /**
   * 시드 데이터 삭제
   * @param {import('sequelize').QueryInterface} queryInterface - Sequelize QueryInterface
   */
  async down(queryInterface) {
    // Hacker News source의 ID 조회
    const sources = await queryInterface.sequelize.query(
      `SELECT id FROM sources WHERE title = 'Hacker News' LIMIT 1;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (sources.length === 0) {
      console.warn('Hacker News source를 찾을 수 없습니다.');
      return;
    }

    const hackerNewsSourceId = sources[0].id;

    // Hacker News 관련 태그 삭제
    await queryInterface.bulkDelete('sources_tags', {
      source_id: hackerNewsSourceId,
    });

    console.log('✅ Hacker News 스크래핑 태그 설정이 삭제되었습니다.');
  },
};
