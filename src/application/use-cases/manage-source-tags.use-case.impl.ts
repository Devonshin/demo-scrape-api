/**
 * @author Devonshin
 * @date 2025-01-13
 * 소스 태그 관리 Use Case 구현
 */
import {Inject, Injectable, Logger} from '@nestjs/common';
import {IManageSourceTagsUseCase,} from '../ports/in/manage-source-tags.use-case';
import {SourceTagDomain} from '../../domain/entities/source-tag.domain';
import {ISourceTagRepository} from '../../domain/repositories/source-tag.repository.interface';

/**
 * 소스 태그 관리 Use Case 구현
 * 소스별 스크래핑 타겟 필드의 HTML 태그/클래스 정보를 관리합니다.
 */
@Injectable()
export class ManageSourceTagsUseCaseImpl implements IManageSourceTagsUseCase {
  private readonly logger = new Logger(ManageSourceTagsUseCaseImpl.name);

  constructor(
    @Inject('ISourceTagRepository')
    private readonly sourceTagRepository: ISourceTagRepository,
  ) {}

  /**
   * 특정 소스의 모든 태그 조회
   * @param sourceId 소스 ID
   * @returns 소스 태그 목록
   */
  async getSourceTags(sourceId: string): Promise<SourceTagDomain[]> {
    this.logger.log(`소스 태그 조회 시작 - sourceId: ${sourceId}`);
    const tags = await this.sourceTagRepository.findBySourceId(sourceId);
    this.logger.log(`소스 태그 조회 완료 - 개수: ${tags.length}`);
    return tags;
  }

}
