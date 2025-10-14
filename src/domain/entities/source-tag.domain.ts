/**
 * @author Devonshin
 * @date 2025-01-24
 * SourceTag 도메인 엔티티 - 스크래핑 대상 태그 정보를 관리하는 순수 비즈니스 엔티티
 */

/**
 * 소스 태그 도메인 엔티티
 *
 * 이 클래스는 웹 스크래핑을 위한 HTML 태그 선택자 정보를 관리합니다.
 * tagName과 className을 조합하여 CSS 셀렉터를 생성하는 비즈니스 로직을 포함합니다.
 */
export class SourceTagDomain {
  /**
   * SourceTagDomain 생성자
   *
   * @param id - 고유 식별자 (BIGINT)
   * @param sourceId - 소스 ID (어떤 뉴스 소스에 속하는지)
   * @param fieldName - 필드명 (예: 'title', 'content', 'publicationDate')
   * @param tagName - HTML 태그명 (예: 'div', 'span', 'h1')
   * @param className - CSS 클래스명 (예: 'article-title', 'news-content')
   * @param createdAt - 생성 일시
   */
  constructor(
    public readonly id: number,
    public readonly sourceId: string,
    public readonly fieldName: string,
    public readonly tagName: string,
    public readonly className: string,
    public readonly createdAt: Date,
  ) {
  }

  /**
   * 정적 팩토리 메서드 - 새로운 SourceTagDomain 인스턴스 생성
   *
   * @param data - 소스 태그 생성에 필요한 데이터
   * @returns 새로운 SourceTagDomain 인스턴스
   */
  static create(data: {
    id: number;
    sourceId: string;
    fieldName: string;
    tagName: string;
    className: string;
    createdAt?: Date;
  }): SourceTagDomain {
    return new SourceTagDomain(
      data.id,
      data.sourceId,
      data.fieldName,
      data.tagName,
      data.className,
      data.createdAt || new Date(),
    );
  }

  /**
   * CSS 셀렉터 생성
   *
   * tagName과 className을 조합하여 CSS 셀렉터 문자열을 반환합니다.
   * 예: tagName='div', className='article-title' → 'div.article-title'
   *
   * @returns CSS 셀렉터 문자열
   */
  generateSelector(): string {
    // className이 비어있지 않으면 tagName.className 형태로 반환
    if (this.tagName && this.className.trim() !== '') {
      return `${this.tagName}${this.className}`;
    }
    // className이 없으면 tagName만 반환
    return this.className;
  }

  /**
   * 특정 필드명인지 확인
   *
   * @param fieldName - 확인할 필드명
   * @returns 일치 여부
   */
  isFieldName(fieldName: string): boolean {
    return this.fieldName === fieldName;
  }

  /**
   * 도메인 엔티티를 JSON 객체로 변환
   *
   * @returns JSON 형태의 객체
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      sourceId: this.sourceId,
      fieldName: this.fieldName,
      tagName: this.tagName,
      className: this.className,
      createdAt: this.createdAt,
    };
  }
}
