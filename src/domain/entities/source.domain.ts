/**
 * @author Dongwoo
 * @date 2025-10-13
 * 도메인 Source 엔티티 - 순수 비즈니스 로직을 포함하는 엔티티
 */

/**
 * 뉴스 소스 도메인 엔티티
 * 인프라스트럭처에 독립적인 순수 비즈니스 엔티티
 */
export class SourceDomain {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly targetUrl: string,
    public readonly mainWrapper: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,

  ) {}

  /**
   * 정적 팩토리 메서드 - 새로운 SourceDomain 인스턴스 생성
   * @param data 소스 생성에 필요한 데이터
   * @returns 새로운 SourceDomain 인스턴스
   */
  static create(data: {
    id: string;
    title: string;
    targetUrl: string;
    mainWrapper: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): SourceDomain {
    return new SourceDomain(
      data.id,
      data.title,
      data.targetUrl,
      data.mainWrapper,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),

    );
  }

  /**
   * 도메인 엔티티를 JSON 객체로 변환
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      title: this.title,
      targetUrl: this.targetUrl,
      mainWrapper: this.mainWrapper,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
