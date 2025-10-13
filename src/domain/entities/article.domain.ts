/**
 * @author Dongwoo
 * @date 2025-10-13
 * 도메인 Article 엔티티 - 순수 비즈니스 로직을 포함하는 엔티티
 */

/**
 * 기사 도메인 엔티티
 * 인프라스트럭처에 독립적인 순수 비즈니스 엔티티
 */
export class ArticleDomain {
  constructor(
    public readonly id: string,
    public readonly sourceId: string,
    public readonly title: string,
    public readonly url: string,
    public readonly publicationDate: Date | null,
    public readonly createdAt: Date,
  ) {}

  /**
   * 기사 제목에서 키워드 추출
   * @returns 제목에서 추출한 키워드 배열
   */
  extractKeywords(): string[] {
    // 제목을 단어로 분리 (공백, 특수문자 기준)
    const words = this.title
      .split(/[\s\,\.\!\?\-\(\)\[\]\{\}]+/)
      .filter(word => word.length > 1) // 1글자 이하 제외
      .map(word => word.substring(0, 50)); // 50자 제한

    // 중복 제거 후 반환
    return [...new Set(words)];
  }

  /**
   * 도메인 엔티티를 JSON 객체로 변환
   */
  /**
   * 조회수 증가
   * @returns 새로운 ArticleDomain 인스턴스 (불변성 유지)
   */
  incrementViewCount(): ArticleDomain {
    return new ArticleDomain(
      this.id,
      this.sourceId,
      this.title,
      this.url,
      this.publicationDate,
      this.createdAt
    );
  }

  /**
   * 도메인 엔티티를 JSON 객체로 변환
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      sourceId: this.sourceId,
      title: this.title,
      url: this.url,
      publicationDate: this.publicationDate,
      createdAt: this.createdAt,
    };
  }
}
