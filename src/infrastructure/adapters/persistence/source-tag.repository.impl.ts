/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag Mise en œuvre du référentiel
 */
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {ISourceTagRepository} from '../../../domain/repositories/source-tag.repository.interface';
import {SourceTagDomain} from '../../../domain/entities/source-tag.domain';
import {SourceTag} from "../../../entities/source/source-tag.entity";
import {uuidToBuffer} from '../../../common/utils/uuid.util';

/**
 * SourceTag Mise en œuvre du référentiel
 */
@Injectable()
export class SourceTagRepositoryImpl implements ISourceTagRepository {
  constructor (
    @InjectModel(SourceTag)
    private readonly sourceTagModel: typeof SourceTag,
  ) {
  }

  /**
   * Convertir les entités en modèles de domaine
   * @param entity Entités séquentielles
   * @returns Modèle de domaine
   */
  private toDomain (entity: SourceTag): SourceTagDomain {
    return SourceTagDomain.create({
      id: entity.id,
      sourceId: entity.sourceId,
      fieldName: entity.fieldName,
      tagName: entity.tagName,
      className: entity.className ?? '', // Convertir en chaîne vide si elle est nulle
      createdAt: entity.createdAt,
    });
  }

  /**
   * Conversion des modèles de domaine en propriétés d'entités
   * @param domain
   * @returns entités
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
   * Afficher toutes les étiquettes d'une source spécifique
   * @param sourceId 소스 ID
   * @returns Une liste de balises de cette source
   */
  async findBySourceId (sourceId: string): Promise<SourceTagDomain[]> {
    const entities = await this.sourceTagModel.findAll({
      where: {sourceId: uuidToBuffer(sourceId)},
      order: [['field_name', 'ASC']],
    });

    return entities.map((entity) => this.toDomain(entity));
  }
}
