/**
 * @author Devonshin
 * @date 2025-01-14
 * Sources 테이블 초기 데이터 시더
 */
'use strict';

/**
 * Sources 초기 데이터
 * BBC News와 Hacker News 소스 정보
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sources = [
      {
        id: Buffer.from('72BDC8C6CD434E41BD7912A13E16C8B7', 'hex'),
        created_at: new Date('2025-10-13 20:48:16'),
        updated_at: new Date('2025-10-13 20:48:16'),
        title: 'BBC News',
        target_url: 'https://www.bbc.com/news',
        main_wrapper: 'a[data-testid="internal-link"]',
      },
      {
        id: Buffer.from('BFE2872E0B3145528ED8FBA41BCA6CFD', 'hex'),
        created_at: new Date('2025-10-13 20:48:16'),
        updated_at: new Date('2025-10-13 20:48:16'),
        title: 'Hacker News',
        target_url: 'https://news.ycombinator.com',
        main_wrapper: 'tr#bigbox tr.athing',
      },
    ];

    await queryInterface.bulkInsert('sources', sources, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sources', null, {});
  },
};
