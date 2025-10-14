/**
 * @author Dongwoo
 * @date 2025-10-13
 * 초기 시드 데이터 - 기본 뉴스 소스 추가 (PRD 구조)
 */
const { v4: uuidv4, uuidParse } = require('uuid');
function uuidToBuffer(uuid) {
  const hex = uuid.replace(/-/g, '');
  return Buffer.from(hex, 'hex');
}
/**
 * 초기 뉴스 소스 데이터를 추가하는 시더
 */
module.exports = {
  /**
   * 시드 데이터 생성
   * @param queryInterface - Sequelize QueryInterface
   */
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('sources', [
      {
        id: uuidToBuffer(uuidv4()),
        title: 'Hacker News',
        target_url: 'https://news.ycombinator.com',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidToBuffer(uuidv4()),
        title: 'BBC News',
        target_url: 'https://www.bbc.com/news',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  /**
   * 시드 데이터 삭제
   * @param queryInterface - Sequelize QueryInterface
   */
  async down(queryInterface) {
    await queryInterface.bulkDelete('sources', {}, {});
  },
};
