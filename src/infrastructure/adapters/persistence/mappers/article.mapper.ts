/**
 * @author Dongwoo
 * @date 2025-10-13
 * Article Mapper - Conversion entre entités de domaine et entités Sequelize
 */
import {ArticleDomain} from '../../../../domain/entities/article.domain';
import {Article} from '../../../../entities/entity.module';

/**
 * Article Mapper
 * Responsable de la conversion entre les entités Sequelize et les entités du domaine
 */
export class ArticleMapper {
  /**
   * Convertir les entités Sequelize en entités de domaine
   * @param article Séquencer l'entité d'article
   * @returns Entités d'article du domaine
   */
  static toDomain(article: Article): ArticleDomain {
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
   * Convertir les entités du domaine en données pour la création d'entités Sequelize
   * @param domain Entité du domaine de l'article
   * @returns Données relatives à la création de l'article
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
   * Convertir plusieurs entités en un tableau d'entités de domaine
   * @param articles Tableau des entités d'article
   * @returns Article 도메인 엔티티 배열
   */
  static toDomainList(articles: Article[]): ArticleDomain[] {
    return articles.map((article) => this.toDomain(article));
  }
}
