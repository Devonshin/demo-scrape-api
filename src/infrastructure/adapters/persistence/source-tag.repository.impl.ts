/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag 리포지토리 구현체 - Sequelize를 사용한 영속성 계층
 */
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {ISourceTagRepository} from '../../../domain/repositories/source-tag.repository.interface';
import {SourceTagDomain} from '../../../domain/entities/source-tag.domain';
import {SourceTag} from "../../../entities/source-tag.entity";
import {uuidToBuffer} from '../../../common/utils/uuid.util';

/**
 * SourceTag 리포지토리 구현체
 * Sequelize ORM을 사용하여 sources_tags 테이블과 상호작용
 */
@Injectable()
export class SourceTagRepositoryImpl implements ISourceTagRepository {
  constructor (
    @InjectModel(SourceTag)
    private readonly sourceTagModel: typeof SourceTag,
  ) {
  }

  /**
   * 엔티티를 도메인 모델로 변환
   * @param entity Sequelize 엔티티
   * @returns 도메인 모델
   */
  private toDomain (entity: SourceTag): SourceTagDomain {
    return SourceTagDomain.create({
      id: entity.id,
      sourceId: entity.sourceId,
      fieldName: entity.fieldName,
      tagName: entity.tagName,
      className: entity.className ?? '', // null일 경우 빈 문자열로 변환
      createdAt: entity.createdAt,
    });
  }

  /**
   * 도메인 모델을 엔티티 속성으로 변환
   * @param domain 도메인 모델
   * @returns 엔티티 속성
   */
  private toEntity (domain: SourceTagDomain): Partial<SourceTag> {
    return {
      id: domain.id,
      sourceId: domain.sourceId,
      fieldName: domain.fieldName,
      tagName: domain.tagName,
      className: domain.className || null, // 빈 문자열을 null로 변환
      createdAt: domain.createdAt,
    };
  }

  /**
   * 특정 소스의 모든 태그 조회
   * @param sourceId 소스 ID
   * @returns 해당 소스의 태그 목록
   */
  async findBySourceId (sourceId: string): Promise<SourceTagDomain[]> {
    const entities = await this.sourceTagModel.findAll({
      where: {sourceId: uuidToBuffer(sourceId)},
      order: [['field_name', 'ASC']],
    });

    return entities.map((entity) => this.toDomain(entity));
  }
}
