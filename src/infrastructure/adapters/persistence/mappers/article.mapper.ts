/**
 * @author Dongwoo
 * @date 2025-10-13
 * Article Mapper - 도메인 엔티티와 Sequelize 엔티티 간 변환
 */
import {ArticleDomain} from '../../../../domain/entities/article.domain';
import {Article} from '../../../../entities/entity.module';

/**
 * Article Mapper
 * Sequelize 엔티티와 도메인 엔티티 간 변환을 담당
 */
export class ArticleMapper {
  /**
   * Sequelize 엔티티를 도메인 엔티티로 변환
   * @param article Sequelize Article 엔티티
   * @returns Article 도메인 엔티티
   */
  static toDomain(article: Article): ArticleDomain {
    // Sequelize getter를 사용하여 값 가져오기
    return new ArticleDomain(
      article.get('id'),
      article.get('sourceId'),
      article.get('title'),
      article.get('url'),
      article.get('publicationDate') ?? null,
      article.get('createdAt'),
    );
  }

  /**
   * 도메인 엔티티를 Sequelize 엔티티 생성용 데이터로 변환
   * @param domain Article 도메인 엔티티
   * @returns Sequelize Article 생성 데이터
   */
  static toPersistence(domain: ArticleDomain): Partial<Article> {
    return {
      id: domain.id,
      sourceId: domain.sourceId,
      title: domain.title,
      url: domain.url,
      publicationDate: domain.publicationDate ?? undefined,
    };
  }

  /**
   * 여러 Sequelize 엔티티를 도메인 엔티티 배열로 변환
   * @param articles Sequelize Article 엔티티 배열
   * @returns Article 도메인 엔티티 배열
   */
  static toDomainList(articles: Article[]): ArticleDomain[] {
    return articles.map((article) => this.toDomain(article));
  }
}
