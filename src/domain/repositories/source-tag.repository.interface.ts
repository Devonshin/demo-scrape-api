/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag 리포지토리 인터페이스 - 도메인 계층에서 정의하는 영속성 계약
 */
import {SourceTagDomain} from '../entities/source-tag.domain';

/**
 * SourceTag 리포지토리 인터페이스
 * 인프라스트럭처 계층에서 구현해야 하는 계약
 */
export interface ISourceTagRepository {

  /**
   * 특정 소스의 모든 태그 조회
   * @param sourceId 소스 ID
   * @returns 해당 소스의 태그 목록
   */
  findBySourceId(sourceId: string): Promise<SourceTagDomain[]>;
}
