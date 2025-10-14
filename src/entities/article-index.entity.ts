/**
 * @author Dongwoo
 * @date 2025-10-13
 * ArticleIndex 엔티티 - 기사 제목의 단어별 검색 인덱스를 저장하는 테이블
 */
import {BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table} from 'sequelize-typescript';
import {Article} from './article.entity';
import {bufferToUuid, uuidToBuffer} from "../common/utils/uuid.util";

/**
 * 기사 인덱스 엔티티
 * 기사 제목을 단어 단위로 분리하여 검색 최적화를 위한 인덱스를 저장
 */
@Table({
  tableName: 'article_indexes',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      // 기본 인덱스: 검색 및 정렬용
      fields: ['title_fragment', 'created_at'],
      name: 'idx_title_fragment_created_at',  // 명시적 이름으로 중복 방지
    },
    {
      // 커버링 인덱스: 검색 시 article_id를 포함하여 Index-Only Scan 가능
      fields: ['title_fragment', 'article_id'],
      name: 'idx_title_fragment_article_id',
    },
  ],
})
export class ArticleIndex extends Model {
  /** 자동 증가 기본 키 */
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  /** 제목 단편 (단어 단위로 분리된 제목의 일부) */
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  declare titleFragment: string;

  /** 기사 외래 키 */
  @ForeignKey(() => Article)
  @Column({
    type: 'BINARY(16)',
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('articleId') as Buffer;
      return rawValue ? bufferToUuid(rawValue) : null;
    },
    set(value: string) {
      this.setDataValue('articleId', value ? uuidToBuffer(value) : null);
    },
  })
  declare articleId: string;

  /** 생성 시간 */
  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  /** Article과의 관계 (N:1) */
  @BelongsTo(() => Article)
  article?: Article;
}
