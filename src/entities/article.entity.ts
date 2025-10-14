/**
 * @author Dongwoo
 * @date 2025-10-13
 * Article 엔티티 - 수집된 뉴스 기사 정보를 저장하는 테이블
 */
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Source } from './source.entity';
import { ArticleIndex } from './article-index.entity';
import {bufferToUuid, uuidToBuffer} from "../common/utils/uuid.util";

/**
 * 뉴스 기사 엔티티
 * 스크래핑된 뉴스 기사의 상세 정보를 저장
 */
@Table({
  tableName: 'articles',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['source_id'],
      name: 'idx_articles_source_id',
    },
    {
      fields: [{ name: 'created_at', order: 'DESC' }],
      name: 'idx_articles_created_at',
    },
    {
      fields: [{ name: 'publication_date', order: 'DESC' }, 'source_id'],
      name: 'idx_articles_publication_date_source_id',
    },
    {
      fields: ['source_id', { name: 'publication_date', order: 'DESC' }],
      name: 'idx_articles_source_id_publication_date',
    },
  ],
})
export class Article extends Model {
  /** UUID 기본 키 */
  @Column({
    type: DataType.BLOB,
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

  /** 소스 외래 키 */
  @ForeignKey(() => Source)
  @Column({
    type: DataType.BLOB,
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

  /** 기사 제목 */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare title: string;

  /** 원본 URL */
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    unique: true,
  })
  declare url: string;

  /** 게시 일시 */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare publicationDate: Date | null;

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

  /** Source와의 관계 (N:1) */
  @BelongsTo(() => Source)
  source?: Source;

  /** ArticleIndex와의 관계 (1:N) */
  @HasMany(() => ArticleIndex)
  indexes?: ArticleIndex[];

}
