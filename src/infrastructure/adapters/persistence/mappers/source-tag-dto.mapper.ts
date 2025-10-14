/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag DTO Mapper - Domain ↔ DTO 변환
 */
import {SourceTagDomain} from '../../../../domain/entities/source-tag.domain';
import {SourceTagResponseDto} from '../../../../application/dto/source-tag.dto';

/**
 * SourceTag DTO Mapper
 * 도메인 엔티티를 DTO로 변환
 */
export class SourceTagDtoMapper {
  /**
   * 도메인 엔티티를 응답 DTO로 변환
   * @param domain 도메인 엔티티
   * @returns 응답 DTO
   */
  static toDto(domain: SourceTagDomain): SourceTagResponseDto {
    const dto = new SourceTagResponseDto();
    dto.id = domain.id;
    dto.sourceId = domain.sourceId;
    dto.fieldName = domain.fieldName;
    dto.tagName = domain.tagName;
    dto.className = domain.className || null;
    dto.createdAt = domain.createdAt;
    return dto;
  }

  /**
   * 도메인 엔티티 배열을 DTO 배열로 변환
   * @param domains 도메인 엔티티 배열
   * @returns DTO 배열
   */
  static toDtoList(domains: SourceTagDomain[]): SourceTagResponseDto[] {
    return domains.map((domain) => this.toDto(domain));
  }
}
