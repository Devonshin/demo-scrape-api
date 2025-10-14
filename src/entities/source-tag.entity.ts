/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag 엔티티 - 동적 스크래핑을 위한 타겟 필드별 태그/클래스명 정보
 */
import {BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table,} from 'sequelize-typescript';
import {Source} from './source.entity';
import {bufferToUuid, uuidToBuffer} from "../common/utils/uuid.util";

/**
 * 소스 태그 엔티티
 * 각 소스의 스크래핑 타겟 필드별 HTML 태그 및 클래스 정보 관리
 */
@Table({
  tableName: 'sources_tags',
  timestamps: false, // created_at만 사용, updated_at 없음
  underscored: true,
  indexes: [
    {
      fields: ['source_id'],
      name: 'idx_sources_tags_source_id',
    },
  ],
})
export class SourceTag extends Model {
  /** BIGINT 기본 키 (AUTO_INCREMENT) */
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  /** 소스 ID (UUID, sources 테이블 참조) */
  @ForeignKey(() => Source)
  @Column({
    type: 'BINARY(16)',
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('sourceId') as Buffer;
      return rawValue ? bufferToUuid(rawValue) : null;
    },
    set(value: string) {
      this.setDataValue('sourceId', value ? uuidToBuffer(value) : null);
    },
  })
  declare sourceId: string;

  /** 타겟 필드 이름 (예: title, summary, date, link) */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '타겟 대상 이름 (제목|요약|생성날짜|링크)',
  })
  declare fieldName: string;

  /** HTML 태그명 (예: h1, div, span, a) */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '타겟 대상 HTML 태그명',
  })
  declare tagName: string;

  /** CSS 클래스명 (선택적) */
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: '타겟 대상 CSS 클래스명',
  })
  declare className: string | null;

  /** 생성 시간 */
  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  /** Source와의 관계 (N:1) */
  @BelongsTo(() => Source)
  source?: Source;
}
