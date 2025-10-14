/**
 * @author Devonshin
 * @date 2025-01-14
 * ArticleIndexes 테이블 샘플 데이터 시더
 * article의 제목을 토큰화하여 검색 인덱스를 생성합니다.
 */
'use strict';

/**
 * ArticleIndexes 샘플 데이터
 * 샘플 article들의 제목을 토큰화한 검색 인덱스
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const articleIndexes = [
      // BBC News articles indexes
      // "Shamans openly using psychedelic drugs for treatment in South Africa"
      {
        title_fragment: 'shamans',
        article_id: Buffer.from('017362D0D03E4EFB8762117B48E8E0AD', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'openly',
        article_id: Buffer.from('017362D0D03E4EFB8762117B48E8E0AD', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'using',
        article_id: Buffer.from('017362D0D03E4EFB8762117B48E8E0AD', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'psychedelic',
        article_id: Buffer.from('017362D0D03E4EFB8762117B48E8E0AD', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'drugs',
        article_id: Buffer.from('017362D0D03E4EFB8762117B48E8E0AD', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'treatment',
        article_id: Buffer.from('017362D0D03E4EFB8762117B48E8E0AD', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'south',
        article_id: Buffer.from('017362D0D03E4EFB8762117B48E8E0AD', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'africa',
        article_id: Buffer.from('017362D0D03E4EFB8762117B48E8E0AD', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      // "Rescued Ukrainian lion undergoes critical surgery"
      {
        title_fragment: 'rescued',
        article_id: Buffer.from('0F68CF71BFA94123ABF7BEC694A5CA0C', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'ukrainian',
        article_id: Buffer.from('0F68CF71BFA94123ABF7BEC694A5CA0C', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'lion',
        article_id: Buffer.from('0F68CF71BFA94123ABF7BEC694A5CA0C', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'undergoes',
        article_id: Buffer.from('0F68CF71BFA94123ABF7BEC694A5CA0C', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'critical',
        article_id: Buffer.from('0F68CF71BFA94123ABF7BEC694A5CA0C', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      {
        title_fragment: 'surgery',
        article_id: Buffer.from('0F68CF71BFA94123ABF7BEC694A5CA0C', 'hex'),
        created_at: new Date('2025-10-14 01:14:17'),
      },
      // Hacker News articles indexes
      // "China now leads the U.S. in open-weight AI"
      {
        title_fragment: 'china',
        article_id: Buffer.from('01C7479EDDE84074BBFBFE551D0F585B', 'hex'),
        created_at: new Date('2025-10-14 01:40:45'),
      },
      {
        title_fragment: 'leads',
        article_id: Buffer.from('01C7479EDDE84074BBFBFE551D0F585B', 'hex'),
        created_at: new Date('2025-10-14 01:40:45'),
      },
      {
        title_fragment: 'open-weight',
        article_id: Buffer.from('01C7479EDDE84074BBFBFE551D0F585B', 'hex'),
        created_at: new Date('2025-10-14 01:40:45'),
      },
      {
        title_fragment: 'ai',
        article_id: Buffer.from('01C7479EDDE84074BBFBFE551D0F585B', 'hex'),
        created_at: new Date('2025-10-14 01:40:45'),
      },
      // "German state replaces Microsoft Exchange and Outlook with open-source email"
      {
        title_fragment: 'german',
        article_id: Buffer.from('043D6A29D9AF48AB90A2ABB0C8DEF0C7', 'hex'),
        created_at: new Date('2025-10-14 01:59:40'),
      },
      {
        title_fragment: 'state',
        article_id: Buffer.from('043D6A29D9AF48AB90A2ABB0C8DEF0C7', 'hex'),
        created_at: new Date('2025-10-14 01:59:40'),
      },
      {
        title_fragment: 'replaces',
        article_id: Buffer.from('043D6A29D9AF48AB90A2ABB0C8DEF0C7', 'hex'),
        created_at: new Date('2025-10-14 01:59:40'),
      },
      {
        title_fragment: 'microsoft',
        article_id: Buffer.from('043D6A29D9AF48AB90A2ABB0C8DEF0C7', 'hex'),
        created_at: new Date('2025-10-14 01:59:40'),
      },
      {
        title_fragment: 'exchange',
        article_id: Buffer.from('043D6A29D9AF48AB90A2ABB0C8DEF0C7', 'hex'),
        created_at: new Date('2025-10-14 01:59:40'),
      },
      {
        title_fragment: 'outlook',
        article_id: Buffer.from('043D6A29D9AF48AB90A2ABB0C8DEF0C7', 'hex'),
        created_at: new Date('2025-10-14 01:59:40'),
      },
      {
        title_fragment: 'open-source',
        article_id: Buffer.from('043D6A29D9AF48AB90A2ABB0C8DEF0C7', 'hex'),
        created_at: new Date('2025-10-14 01:59:40'),
      },
      {
        title_fragment: 'email',
        article_id: Buffer.from('043D6A29D9AF48AB90A2ABB0C8DEF0C7', 'hex'),
        created_at: new Date('2025-10-14 01:59:40'),
      },
      // "Gemini 2.5 Computer Use model"
      {
        title_fragment: 'gemini',
        article_id: Buffer.from('09440D6990EC43D2B875A308E7C0A417', 'hex'),
        created_at: new Date('2025-10-14 01:40:35'),
      },
      {
        title_fragment: 'computer',
        article_id: Buffer.from('09440D6990EC43D2B875A308E7C0A417', 'hex'),
        created_at: new Date('2025-10-14 01:40:35'),
      },
      {
        title_fragment: 'use',
        article_id: Buffer.from('09440D6990EC43D2B875A308E7C0A417', 'hex'),
        created_at: new Date('2025-10-14 01:40:35'),
      },
      {
        title_fragment: 'model',
        article_id: Buffer.from('09440D6990EC43D2B875A308E7C0A417', 'hex'),
        created_at: new Date('2025-10-14 01:40:35'),
      },
    ];

    await queryInterface.bulkInsert('article_indexes', articleIndexes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('article_indexes', null, {});
  },
};
