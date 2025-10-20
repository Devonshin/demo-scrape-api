/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag Entités - informations sur le nom de la balise/classe par champ cible pour le scraping dynamique
 */
import {BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table,} from 'sequelize-typescript';
import {Source} from './source.entity';
import {bufferToUuid, uuidToBuffer} from "../../common/utils/uuid.util";

/**
 * 소스 태그 엔티티
 * 각 소스의 스크래핑 타겟 필드별 HTML 태그 및 클래스 정보 관리
 */
@Table({
  tableName: 'sources_tags',
  timestamps: false, // Utiliser uniquement created_at, pas de updated_at
  underscored: true,
  indexes: [
    {
      fields: ['source_id'],
      name: 'idx_sources_tags_source_id',
    },
  ],
})
export class SourceTag extends Model {
  /** BIGINT Clé primaire (AUTO_INCREMENT) */
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  /** ID de la source (UUID, voir le tableau des sources) */
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
    comment: "ID de la source (UUID, voir le tableau des sources)"
  })
  declare sourceId: string;

  /** Le nom du champ cible (par exemple: title, summary, date, link) */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Nom du public cible (Titre|Résumé|Date de création|Lien)',
  })
  declare fieldName: string;

  /** Les noms des balises HTML (par exemple: h1, div, span, a) */
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Nom de la balise HTML cible',
  })
  declare tagName: string;

  /** Nom de la classe CSS (facultatif) */
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'Nom de la classe CSS cible',
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
