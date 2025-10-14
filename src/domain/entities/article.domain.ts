/**
 * @author Dongwoo
 * @date 2025-10-13
 * Entités d'article de domaine - entités qui contiennent une logique purement commerciale
 */

/**
 * Entités du domaine de l'article
 * Entité commerciale indépendante de l'infrastructure
 */
export class ArticleDomain {
  constructor(
    public readonly id: string,
    public readonly sourceId: string,
    public readonly title: string,
    public readonly url: string,
    public readonly publicationDate: Date | null,
    public readonly createdAt: Date,
  ) {}

  /**
   * Convertir les entités du domaine en objets JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      sourceId: this.sourceId,
      title: this.title,
      url: this.url,
      publicationDate: this.publicationDate,
      createdAt: this.createdAt,
    };
  }
}
