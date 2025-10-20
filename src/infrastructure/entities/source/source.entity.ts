/**
 * @author Dongwoo
 * @date 2025-10-13
 * Entité source - une table qui stocke les informations relatives à la source de l'information.
 */
import {Column, CreatedAt, DataType, HasMany, Model, Table, UpdatedAt} from 'sequelize-typescript';
import {Article} from '../article/article.entity';
import {SourceTag} from './source-tag.entity';
import {bufferToUuid, uuidToBuffer} from "../../../common/utils/uuid.util";

/**
 * Entités de la source d'information
 * La structure du tableau des sources selon la définition du PRD
 */
@Table({
  tableName: 'sources',
  timestamps: true,
  underscored: true,
  indexes: [],
})
export class Source extends Model {
  /** UUID Clé primaire */
  @Column({
    type: 'BINARY(16)',
    primaryKey: true,
    get() {
      const rawValue = this.getDataValue('id') as Buffer;
      if (!rawValue || !Buffer.isBuffer(rawValue) || rawValue.length !== 16) {
        return null;
      }
      return bufferToUuid(rawValue);
    },
    set(value: string) {
      this.setDataValue('id', value ? uuidToBuffer(value) : null);
    },
  })
  declare id: string;

  /** Nom du public cible */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare title: string;

  /** Adresse du domaine de destination */
  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare targetUrl: string;

  /** Crawl de la classe principale */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare mainWrapper: string;

  /** Temps de création */
  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  /** Temps de modification */
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;

  /** Relation avec les articles (1:N) */
  @HasMany(() => Article)
  articles?: Article[];

  /** Relation avec SourceTag (1:N) */
  @HasMany(() => SourceTag)
  tags?: SourceTag[];
}
