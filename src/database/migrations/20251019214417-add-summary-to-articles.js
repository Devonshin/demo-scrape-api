'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // articles 테이블에 summary 컬럼 추가
    await queryInterface.addColumn('articles', 'summary', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Article summary'
    });
  },

  async down (queryInterface, Sequelize) {
    // 롤백 시 summary 컬럼 제거
    await queryInterface.removeColumn('articles', 'summary');
  }
};
