/**
 * @author Devonshin
 * @date 2025-01-13
 * 스크래퍼 관련 커스텀 예외 클래스들
 */

/**
 * 스크래핑 기본 예외
 */
export class ScraperException extends Error {
  constructor(
    message: string,
    public readonly sourceId?: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'ScraperException';
    Object.setPrototypeOf(this, ScraperException.prototype);
  }
}

/**
 * 태그 설정 누락 예외
 * 필수 태그 설정이 없을 때 발생
 */
export class MissingTagConfigException extends ScraperException {
  constructor(
    public readonly sourceId: string,
    public readonly missingFields: string[],
  ) {
    super(
      `Missing required tag configurations for source ${sourceId}: ${missingFields.join(', ')}`,
      sourceId,
    );
    this.name = 'MissingTagConfigException';
    Object.setPrototypeOf(this, MissingTagConfigException.prototype);
  }
}

/**
 * 셀렉터 매칭 실패 예외
 * 셀렉터로 요소를 찾지 못했을 때 발생
 */
export class SelectorMatchException extends ScraperException {
  constructor(
    public readonly sourceId: string,
    public readonly selector: string,
    public readonly fieldName: string,
  ) {
    super(
      `Failed to match selector '${selector}' for field '${fieldName}' in source ${sourceId}`,
      sourceId,
    );
    this.name = 'SelectorMatchException';
    Object.setPrototypeOf(this, SelectorMatchException.prototype);
  }
}

/**
 * 네트워크 오류 예외
 * HTTP 요청 실패 시 발생
 */
export class NetworkException extends ScraperException {
  constructor(
    message: string,
    public readonly url: string,
    public readonly statusCode?: number,
    cause?: Error,
  ) {
    super(message, undefined, cause);
    this.name = 'NetworkException';
    Object.setPrototypeOf(this, NetworkException.prototype);
  }
}

/**
 * HTML 파싱 오류 예외
 * Cheerio 파싱 실패 시 발생
 */
export class HtmlParsingException extends ScraperException {
  constructor(
    message: string,
    public readonly sourceId: string,
    cause?: Error,
  ) {
    super(message, sourceId, cause);
    this.name = 'HtmlParsingException';
    Object.setPrototypeOf(this, HtmlParsingException.prototype);
  }
}

/**
 * 데이터 검증 실패 예외
 * 추출된 데이터가 유효하지 않을 때 발생
 */
export class DataValidationException extends ScraperException {
  constructor(
    message: string,
    public readonly sourceId: string,
    public readonly fieldName: string,
    public readonly invalidValue?: any,
  ) {
    super(message, sourceId);
    this.name = 'DataValidationException';
    Object.setPrototypeOf(this, DataValidationException.prototype);
  }
}
