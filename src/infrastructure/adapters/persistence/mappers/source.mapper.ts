/**
 * @author Dongwoo
 * @date 2025-10-13
 * Source Mapper - Domain과 Persistence 엔티티 변환
 */
import {SourceDomain} from '../../../../domain/entities/source.domain';
import {Source} from "../../../../entities/source.entity";

/**
 * Source 엔티티 변환 mapper
 * Domain 엔티티와 Sequelize 엔티티 간 변환 담당
 */
export class SourceMapper {
  /**
   * Sequelize 엔티티를 Domain 엔티티로 변환
   * @param source Sequelize Source 엔티티
   * @returns SourceDomain 엔티티
   */
  static toDomain(source: Source): SourceDomain {
    // Sequelize getter를 사용하여 값 가져오기
    return new SourceDomain(
      source.get('id'),
      source.get('title'),
      source.get('targetUrl'),
      source.get('mainWrapper'),
      source.get('createdAt'),
      source.get('updatedAt'),
    );
  }

  /**
   * Domain 엔티티를 Sequelize 엔티티로 변환
   * @param domain SourceDomain 엔티티
   * @returns Sequelize Source 데이터
   */
  static toPersistence(domain: SourceDomain): Partial<Source> {
    return {
      id: domain.id,
      title: domain.title,
      targetUrl: domain.targetUrl,
    };
  }

  /**
   * Sequelize 엔티티 배열을 Domain 엔티티 배열로 변환
   * @param sources Sequelize Source 엔티티 배열
   * @returns SourceDomain 엔티티 배열
   */
  static toDomainList(sources: Source[]): SourceDomain[] {
    return sources.map((source) => this.toDomain(source));
  }
}
