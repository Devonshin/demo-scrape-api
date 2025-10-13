/**
 * @author Dongwoo
 * @date 2025-10-13
 * Source Repository 구현 - ISourceRepository 구현체
 */
import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {ISourceRepository} from '../../../domain/repositories/source.repository.interface';
import {SourceDomain} from '../../../domain/entities/source.domain';
import {Source} from '../../../entities';
import {SourceMapper} from './mappers/source.mapper';

/**
 * Source Repository 구현
 * Sequelize를 사용한 영속성 계층 구현
 */
@Injectable()
export class SourceRepositoryImpl implements ISourceRepository {
  private readonly logger = new Logger(SourceRepositoryImpl.name);

  constructor(
    @InjectModel(Source)
    private readonly sourceModel: typeof Source,
  ) {}

  /**
   * 소스 ID로 조회
   * @param id 소스 ID
   * @returns 조회된 소스 또는 null
   */
  async findById(id: string): Promise<SourceDomain | null> {
    const source = await this.sourceModel.findByPk(id);
    return source ? SourceMapper.toDomain(source) : null;
  }

  /**
   * 소스 title로 조회
   * @param title 소스 title
   * @returns 조회된 소스 또는 null
   */
  async findByName(title: string): Promise<SourceDomain | null> {
    const source = await this.sourceModel.findOne({
      where: { title },
    });
    return source ? SourceMapper.toDomain(source) : null;
  }

  /**
   * 모든 소스 조회
   * @returns 소스 목록
   */
  async findAll(): Promise<SourceDomain[]> {
    const sources = await this.sourceModel.findAll({
      order: [['title', 'ASC']],
    });
    return SourceMapper.toDomainList(sources);
  }

  /**
   * 모든 활성 소스 조회 (PRD에 isActive 필드가 없으므로 findAll과 동일)
   * @returns 모든 소스 목록
   */
  async findAllActive(): Promise<SourceDomain[]> {
    const sources = await this.sourceModel.findAll({
      order: [['title', 'ASC']],
    });
    return SourceMapper.toDomainList(sources);
  }

  /**
   * 소스 저장 (생성 또는 업데이트)
   * @param source 저장할 소스 도메인 엔티티
   * @returns 저장된 소스
   */
  async save(source: SourceDomain): Promise<SourceDomain> {
    try {
      const data = SourceMapper.toPersistence(source);

      // upsert를 사용하여 생성 또는 업데이트
      const [instance, created] = await this.sourceModel.upsert(data as any);

      this.logger.log(`Source ${created ? 'created' : 'updated'}: ${instance.id}`);

      return SourceMapper.toDomain(instance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to save source: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 마지막 스크래핑 시간 업데이트 (PRD에 lastScrapedAt 필드가 없으므로 공백 구현)
   * @param id 소스 ID
   * @returns 업데이트 성공 여부
   */
  async updateLastScrapedAt(id: string): Promise<boolean> {
    // PRD에 lastScrapedAt 필드가 없으므로 아무 처리하지 않음
    this.logger.log(`updateLastScrapedAt called for source ${id} (no-op in current schema)`);
    return true;
  }

  /**
   * 소스 삭제
   * @param id 삭제할 소스 ID
   * @returns 삭제 성공 여부
   */
  async delete(id: string): Promise<boolean> {
    try {
      const count = await this.sourceModel.destroy({
        where: { id },
      });

      this.logger.log(`Source deleted: ${id}`);
      return count > 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete source: ${errorMessage}`);
      throw error;
    }
  }

}
