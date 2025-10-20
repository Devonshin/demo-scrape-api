/**
 * @author Dongwoo
 * @date 2025-10-13
 * Source Repository 구현 - ISourceRepository 구현체
 */
import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {SourceRepositoryPort} from '../../../application/ports/out/repositories/source.repository.port';
import {SourceDomain} from '../../../domain/entities/source.domain';
import {Source} from '../../entities/entity.module';
import {SourceMapper} from './mappers/source.mapper';
import {uuidToBuffer} from '../../../common/utils/uuid.util';

/**
 * Source Repository 구현
 * Sequelize를 사용한 영속성 계층 구현
 */
@Injectable()
export class SourceRepositoryAdapter implements SourceRepositoryPort {
  private readonly logger = new Logger(SourceRepositoryAdapter.name);

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
    const source = await this.sourceModel.findByPk(uuidToBuffer(id));
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

}
