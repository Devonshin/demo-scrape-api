/**
 * @author Dongwoo
 * @date 2025-10-13
 * Source 엔티티 - 뉴스 소스 정보를 저장하는 테이블
 */
import { Table, Column, Model, DataType, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Article } from './article.entity';

/**
 * 뉴스 소스 엔티티
 * PRD 정의에 따른 sources 테이블 구조
 */
@Table({
  tableName: 'sources',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['title'],
    },
    {
      unique: true,
      fields: ['target_url'],
    },
  ],
})
export class Source extends Model {
  /** UUID 기본 키 */
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  /** 타겟 대상 이름 */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  title!: string;

  /** 타겟 대상 도메인 주소 */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  targetUrl!: string;

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
}
