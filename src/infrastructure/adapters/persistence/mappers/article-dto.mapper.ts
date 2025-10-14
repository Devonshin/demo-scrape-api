/**
 * @author Dongwoo
 * @date 2025-10-13
 * Article DTO mapper - Convert domain entities to DTOs
 */
import {ArticleDomain} from '../../../../domain/entities/article.domain';
import {ArticleDto} from '../../../../application/dto/get-articles-response.dto';

/**
 * Article DTO mapper
 * Convert domain entities to DTOs in the presentation layer
 */
export class ArticleDtoMapper {
  /**
   * Convert domain entities to DTOs
   * @param domain Domain entity
   * @returns DTO
   */
  static toDto(domain: ArticleDomain): ArticleDto {
    return {
      id: domain.id,
      sourceId: domain.sourceId,
      title: domain.title,
      url: domain.url,
      publicationDate: domain.publicationDate!,
      createdAt: domain.createdAt,
    };
  }

  /**
   * Convert list of domain entities to list of DTOs
   * @param domains Domain Entity List
   * @returns DTO list
   */
  static toDtoList(domains: ArticleDomain[]): ArticleDto[] {
    return domains.map((domain) => this.toDto(domain));
  }
}
