/**
 * @author Devonshin
 * @date 2025-01-14
 * Articles 테이블 샘플 데이터 시더
 * 실제 운영에서는 스크래핑을 통해 데이터를 수집합니다.
 */
'use strict';

/**
 * Articles 샘플 데이터
 * 각 소스별로 몇 개의 샘플 article 포함
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bbcSourceId = Buffer.from('72BDC8C6CD434E41BD7912A13E16C8B7', 'hex');
    const hackerNewsSourceId = Buffer.from('BFE2872E0B3145528ED8FBA41BCA6CFD', 'hex');

    const articles = [
      // BBC News 샘플 articles
      {
        id: Buffer.from('017362D0D03E4EFB8762117B48E8E0AD', 'hex'),
        source_id: bbcSourceId,
        title: 'Shamans openly using psychedelic drugs for treatment in South Africa',
        created_at: new Date('2025-10-14 01:14:03'),
        updated_at: new Date('2025-10-14 01:14:17'),
        publication_date: new Date('2025-10-13 01:14:17'),
        url: 'https://www.bbc.com/news/articles/ce329z0qv91o',
      },
      {
        id: Buffer.from('082F7D442D9E428CBB45B332BCC000AF', 'hex'),
        source_id: bbcSourceId,
        title: '\'Your appointment\'s rescheduled\': Shutdown cancels US citizenship ceremonies',
        created_at: new Date('2025-10-14 01:14:03'),
        updated_at: new Date('2025-10-14 01:14:17'),
        publication_date: new Date('2025-10-13 19:14:17'),
        url: 'https://www.bbc.com/news/articles/ckgywnjkrlqo',
      },
      {
        id: Buffer.from('0F68CF71BFA94123ABF7BEC694A5CA0C', 'hex'),
        source_id: bbcSourceId,
        title: 'Rescued Ukrainian lion undergoes critical surgery',
        created_at: new Date('2025-10-14 01:14:03'),
        updated_at: new Date('2025-10-14 01:14:17'),
        publication_date: new Date('2025-10-13 08:14:17'),
        url: 'https://www.bbc.com/news/articles/cy40ykykx9do',
      },
      // Hacker News 샘플 articles
      {
        id: Buffer.from('002FFCA0F82340BFABA374436E66A4A6', 'hex'),
        source_id: hackerNewsSourceId,
        title: '"Fuck You" Companies (aimode.substack.com)',
        created_at: new Date('2025-10-14 01:59:58'),
        updated_at: new Date('2025-10-14 01:59:58'),
        publication_date: new Date('2025-10-13 09:11:44'),
        url: 'https://aimode.substack.com/p/fuck-you-companies',
      },
      {
        id: Buffer.from('01C7479EDDE84074BBFBFE551D0F585B', 'hex'),
        source_id: hackerNewsSourceId,
        title: 'China now leads the U.S. in open-weight AI (washingtonpost.com)',
        created_at: new Date('2025-10-14 01:40:45'),
        updated_at: new Date('2025-10-14 01:40:45'),
        publication_date: new Date('2025-10-13 18:07:38'),
        url: 'https://www.washingtonpost.com/technology/2025/10/13/china-us-open-source-ai/',
      },
      {
        id: Buffer.from('043D6A29D9AF48AB90A2ABB0C8DEF0C7', 'hex'),
        source_id: hackerNewsSourceId,
        title: 'German state replaces Microsoft Exchange and Outlook with open-source email (zdnet.com)',
        created_at: new Date('2025-10-14 01:59:40'),
        updated_at: new Date('2025-10-14 01:59:40'),
        publication_date: new Date('2025-10-13 17:41:25'),
        url: 'https://www.zdnet.com/article/german-state-replaces-microsoft-exchange-and-outlook-with-open-source-email/',
      },
      {
        id: Buffer.from('09440D6990EC43D2B875A308E7C0A417', 'hex'),
        source_id: hackerNewsSourceId,
        title: 'Gemini 2.5 Computer Use model (blog.google)',
        created_at: new Date('2025-10-14 01:40:35'),
        updated_at: new Date('2025-10-14 01:40:35'),
        publication_date: new Date('2025-10-07 17:49:11'),
        url: 'https://blog.google/technology/google-deepmind/gemini-computer-use-model/',
      },
    ];

    await queryInterface.bulkInsert('articles', articles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('articles', null, {});
  },
};
