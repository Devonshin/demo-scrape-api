/**
 * @author Devonshin
 * @date 2025-01-13
 * Classes d'exceptions personnalisées spécifiques aux scrappers
 */

/**
 * Récupération des exceptions par défaut
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
 * Exceptions pour les paramètres de balises manquants
 * Se produit lorsqu'il n'y a pas de paramètres de balise requis
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
 * Exceptions relatives à l'échec de l'appariement du sélecteur
 * Se produit lorsqu'un élément n'est pas trouvé avec le sélecteur
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
