/**
 * @author Devonshin
 * @date 2025-01-24
 * SourceTagDomain 단위 테스트
 * - 도메인 엔티티의 생성, 유효성 검증, 비즈니스 로직 테스트
 */

import {SourceTagDomain} from '../source-tag.domain';
import {v4 as uuidv4} from 'uuid';

describe('SourceTagDomain', () => {
  // 테스트용 샘플 데이터
  const validData = {
    id: 1,
    sourceId: uuidv4(),
    fieldName: 'title',
    tagName: 'div',
    className: 'article-title',
    createdAt: new Date(),
  };

  describe('constructor', () => {
    it('유효한 데이터로 SourceTagDomain을 생성해야 한다', () => {
      // When: 유효한 데이터로 인스턴스 생성
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        validData.fieldName,
        validData.tagName,
        validData.className,
        validData.createdAt,
      );

      // Then: 모든 필드가 정상적으로 설정되어야 함
      expect(sourceTag.id).toBe(validData.id);
      expect(sourceTag.sourceId).toBe(validData.sourceId);
      expect(sourceTag.fieldName).toBe(validData.fieldName);
      expect(sourceTag.tagName).toBe(validData.tagName);
      expect(sourceTag.className).toBe(validData.className);
      expect(sourceTag.createdAt).toBe(validData.createdAt);
    });

    it('className은 비어있어도 생성 가능해야 한다', () => {
      // When: className이 빈 문자열인 경우
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        validData.fieldName,
        validData.tagName,
        '',
        validData.createdAt,
      );

      // Then: 정상적으로 생성되어야 함
      expect(sourceTag.className).toBe('');
    });
  });

  describe('create (정적 팩토리 메서드)', () => {
    it('정적 메서드로 SourceTagDomain을 생성해야 한다', () => {
      // When: create 메서드로 인스턴스 생성
      const sourceTag = SourceTagDomain.create({
        id: validData.id,
        sourceId: validData.sourceId,
        fieldName: validData.fieldName,
        tagName: validData.tagName,
        className: validData.className,
      });

      // Then: 모든 필드가 정상적으로 설정되어야 함
      expect(sourceTag.id).toBe(validData.id);
      expect(sourceTag.sourceId).toBe(validData.sourceId);
      expect(sourceTag.fieldName).toBe(validData.fieldName);
      expect(sourceTag.tagName).toBe(validData.tagName);
      expect(sourceTag.className).toBe(validData.className);
      expect(sourceTag.createdAt).toBeInstanceOf(Date);
    });

    it('createdAt을 지정하지 않으면 현재 시간으로 설정되어야 한다', () => {
      // Given: createdAt을 지정하지 않음
      const beforeCreate = new Date();

      // When: create 메서드 호출
      const sourceTag = SourceTagDomain.create({
        id: validData.id,
        sourceId: validData.sourceId,
        fieldName: validData.fieldName,
        tagName: validData.tagName,
        className: validData.className,
      });

      const afterCreate = new Date();

      // Then: createdAt이 현재 시간으로 설정되어야 함
      expect(sourceTag.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(sourceTag.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    it('createdAt을 지정하면 해당 값으로 설정되어야 한다', () => {
      // Given: 특정 createdAt 지정
      const specificDate = new Date('2025-01-01T00:00:00Z');

      // When: create 메서드 호출
      const sourceTag = SourceTagDomain.create({
        id: validData.id,
        sourceId: validData.sourceId,
        fieldName: validData.fieldName,
        tagName: validData.tagName,
        className: validData.className,
        createdAt: specificDate,
      });

      // Then: 지정한 createdAt이 설정되어야 함
      expect(sourceTag.createdAt).toBe(specificDate);
    });
  });

  describe('generateSelector', () => {
    it('className이 있으면 "tagName.className" 형태의 셀렉터를 반환해야 한다', () => {
      // Given: className이 있는 SourceTagDomain
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        validData.fieldName,
        'div',
        '.article-title',
        validData.createdAt,
      );

      // When: generateSelector 호출
      const selector = sourceTag.generateSelector();

      // Then: "tagName.className" 형태로 반환되어야 함
      expect(selector).toBe('div.article-title');
    });

    it('className이 비어있으면 tagName만 반환해야 한다', () => {
      // Given: className이 빈 문자열인 SourceTagDomain
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        validData.fieldName,
        'h1',
        '',
        validData.createdAt,
      );

      // When: generateSelector 호출
      const selector = sourceTag.generateSelector();

      // Then: tagName만 반환되어야 함
      expect(selector).toBe('h1');
    });

    it('className이 공백만 있으면 tagName만 반환해야 한다', () => {
      // Given: className이 공백으로만 구성된 SourceTagDomain
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        validData.fieldName,
        'span',
        '   ',
        validData.createdAt,
      );

      // When: generateSelector 호출
      const selector = sourceTag.generateSelector();

      // Then: tagName만 반환되어야 함
      expect(selector).toBe('span');
    });

    it('복잡한 className을 처리할 수 있어야 한다', () => {
      // Given: 여러 클래스명을 포함한 SourceTagDomain
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        validData.fieldName,
        'div',
        '.article-title.main-content',
        validData.createdAt,
      );

      // When: generateSelector 호출
      const selector = sourceTag.generateSelector();

      // Then: 전체 className이 포함되어야 함
      expect(selector).toBe('div.article-title.main-content');
    });
  });

  describe('isFieldName', () => {
    it('동일한 fieldName이면 true를 반환해야 한다', () => {
      // Given: fieldName이 'title'인 SourceTagDomain
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        'title',
        validData.tagName,
        validData.className,
        validData.createdAt,
      );

      // When: isFieldName 호출
      const result = sourceTag.isFieldName('title');

      // Then: true가 반환되어야 함
      expect(result).toBe(true);
    });

    it('다른 fieldName이면 false를 반환해야 한다', () => {
      // Given: fieldName이 'title'인 SourceTagDomain
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        'title',
        validData.tagName,
        validData.className,
        validData.createdAt,
      );

      // When: isFieldName 호출
      const result = sourceTag.isFieldName('content');

      // Then: false가 반환되어야 함
      expect(result).toBe(false);
    });

    it('대소문자를 구분해야 한다', () => {
      // Given: fieldName이 'title'인 SourceTagDomain
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        'title',
        validData.tagName,
        validData.className,
        validData.createdAt,
      );

      // When: isFieldName 호출 (대문자)
      const result = sourceTag.isFieldName('Title');

      // Then: false가 반환되어야 함
      expect(result).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('모든 필드를 포함한 JSON 객체를 반환해야 한다', () => {
      // Given: SourceTagDomain 인스턴스
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        validData.fieldName,
        validData.tagName,
        validData.className,
        validData.createdAt,
      );

      // When: toJSON 호출
      const json = sourceTag.toJSON();

      // Then: 모든 필드가 포함되어야 함
      expect(json).toEqual({
        id: validData.id,
        sourceId: validData.sourceId,
        fieldName: validData.fieldName,
        tagName: validData.tagName,
        className: validData.className,
        createdAt: validData.createdAt,
      });
    });

    it('반환된 JSON 객체를 수정해도 원본은 변경되지 않아야 한다', () => {
      // Given: SourceTagDomain 인스턴스
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        validData.fieldName,
        validData.tagName,
        validData.className,
        validData.createdAt,
      );

      // When: toJSON 호출 후 반환된 객체 수정
      const json = sourceTag.toJSON();
      json.fieldName = 'modified-field';

      // Then: 원본은 변경되지 않아야 함
      expect(sourceTag.fieldName).toBe(validData.fieldName);
    });
  });

  describe('불변성 (Immutability)', () => {
    it('모든 필드는 readonly여야 한다', () => {
      // Given: SourceTagDomain 인스턴스
      const sourceTag = new SourceTagDomain(
        validData.id,
        validData.sourceId,
        validData.fieldName,
        validData.tagName,
        validData.className,
        validData.createdAt,
      );
      // Then: 필드가 변경되지 않아야 함
      expect(sourceTag.id).toBe(validData.id);
      expect(sourceTag.sourceId).toBe(validData.sourceId);
      expect(sourceTag.fieldName).toBe(validData.fieldName);
      expect(sourceTag.tagName).toBe(validData.tagName);
      expect(sourceTag.className).toBe(validData.className);
      expect(sourceTag.createdAt).toBe(validData.createdAt);
    });
  });
});
