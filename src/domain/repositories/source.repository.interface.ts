/**
 * @author Dongwoo
 * @date 2025-10-13
 * Source 리포지토리 인터페이스 - 도메인 계층에서 정의하는 영속성 계약
 */
import { SourceDomain } from '../entities/source.domain';

/**
 * Source 리포지토리 인터페이스
 * 인프라스트럭처 계층에서 구현해야 하는 계약
 */
export interface ISourceRepository {

  /**
   * 소스 ID로 조회
   * @param id 소스 ID
   * @returns 조회된 소스 또는 null
   */
  findById(id: string): Promise<SourceDomain | null>;

  /**
   * 소스 이름으로 조회
   * @param name 소스 이름
   * @returns 조회된 소스 또는 null
   */
  findByName(name: string): Promise<SourceDomain | null>;

  /**
   * 모든 소스 조회
   * @returns 소스 목록
   */
  findAll(): Promise<SourceDomain[]>;

}
