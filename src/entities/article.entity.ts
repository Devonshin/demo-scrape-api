/**
 * @author Dongwoo
 * @date 2025-10-13
 * Entité article - une table qui stocke les informations collectées sur les articles de presse.
 */
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import {Source} from './source.entity';
import {ArticleIndex} from './article-index.entity';
import {bufferToUuid, uuidToBuffer} from "../common/utils/uuid.util";

/**
 * Entité de l'article
 * Enregistrer les détails de l'article récupéré
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
  /** Clé primaire UUID */
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

  /** Clé étrangère source */
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

  /** Titre de l'article */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare title: string;

  /** Original URL */
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    unique: true,
  })
  declare url: string;

  /** Date de publication */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare publicationDate: Date | null;

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

  /** Relation avec la source (N:1) */
  @BelongsTo(() => Source)
  source?: Source;

  /** Relation avec ArticleIndex (1:N) */
  @HasMany(() => ArticleIndex)
  indexes?: ArticleIndex[];

}
