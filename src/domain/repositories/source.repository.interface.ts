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

  /**
   * 모든 활성 소스 조회
   * @returns 활성 소스 목록
   */
  findAllActive(): Promise<SourceDomain[]>;

  /**
   * 소스 저장 (생성 또는 업데이트)
   * @param source 저장할 소스 도메인 엔티티
   * @returns 저장된 소스
   */
  save(source: SourceDomain): Promise<SourceDomain>;

  /**
   * 마지막 스크래핑 시간 업데이트
   * @param id 소스 ID
   * @returns 업데이트 성공 여부
   */
  updateLastScrapedAt(id: string): Promise<boolean>;

  /**
   * 소스 삭제
   * @param id 삭제할 소스 ID
   * @returns 삭제 성공 여부
   */
  delete(id: string): Promise<boolean>;

}
