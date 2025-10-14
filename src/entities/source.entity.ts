/**
 * @author Dongwoo
 * @date 2025-10-13
 * Source 엔티티 - 뉴스 소스 정보를 저장하는 테이블
 */
import {Column, CreatedAt, DataType, HasMany, Model, Table, UpdatedAt} from 'sequelize-typescript';
import {Article} from './article.entity';
import {SourceTag} from './source-tag.entity';
import {bufferToUuid, uuidToBuffer} from "../common/utils/uuid.util";

/**
 * 뉴스 소스 엔티티
 * PRD 정의에 따른 sources 테이블 구조
 */
@Table({
  tableName: 'sources',
  timestamps: true,
  underscored: true,
  indexes: [],
})
export class Source extends Model {
  /** UUID 기본 키 */
  @Column({
    type: 'BINARY(16)',
    primaryKey: true,
    get() {
      const rawValue = this.getDataValue('id') as Buffer;
      return rawValue ? bufferToUuid(rawValue) : null;
    },
    set(value: string) {
      this.setDataValue('id', value ? uuidToBuffer(value) : null);
    },
  })
  declare id: string;

  /** 타겟 대상 이름 */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare title: string;

  /** 타겟 대상 도메인 주소 */
  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare targetUrl: string;

  /** 크롤링 메인 클래스 */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare mainWrapper: string;

  /** 생성 시간 */
  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  /** 수정 시간 */
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;

  /** Article과의 관계 (1:N) */
  @HasMany(() => Article)
  articles?: Article[];

  /** SourceTag와의 관계 (1:N) */
  @HasMany(() => SourceTag)
  tags?: SourceTag[];
}
