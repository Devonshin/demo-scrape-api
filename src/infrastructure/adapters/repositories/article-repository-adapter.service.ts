/**
 * @author Dongwoo
 * @date 2025-10-13
 * Implémentation du dépôt d'articles - implémentation de ArticleRepositoryPort
 */
import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {Op} from 'sequelize';
import {
  ArticleFilterOptions,
  ArticleRepositoryPort,
  PaginatedArticles,
  TransactionOptions,
} from '../../../application/ports/out/repositories/article.repository.port';
import {ArticleDomain} from '../../../domain/entities/article.domain';
import {Article, ArticleIndex} from '../../entities/entity.module';
import {ArticleMapper} from './mappers/article.mapper';
import {uuidToBuffer} from '../../../common/utils/uuid.util';

/**
 * Implémentation du dépôt d'articles
 * Couche de persistance implémentée avec Sequelize
 */
@Injectable()
export class ArticleRepositoryAdapter implements ArticleRepositoryPort {

  private readonly logger = new Logger(ArticleRepositoryAdapter.name);

  constructor (
    @InjectModel(Article)
    private readonly articleModel: typeof Article,
    @InjectModel(ArticleIndex)
    private readonly articleIndexModel: typeof ArticleIndex,
  ) {
  }

  /**
   * Enregistrer un article (création ou mise à jour)
   * @param article entité de domaine de l'article à enregistrer
   * @param options options de transaction
   * @returns article enregistré
   */
  async save (article: ArticleDomain, options?: TransactionOptions): Promise<ArticleDomain> {
    try {
      const data = ArticleMapper.toPersistence(article);

      // Créer ou mettre à jour avec upsert
      const [instance, created] = await this.articleModel.upsert(data as any, {
        transaction: options?.transaction,
      });

      // Créer des index de mots-clés (uniquement lors de la création)
      if (created) {
        await this.createArticleIndexes(article.id, article.title, options);
      }

      this.logger.log(`Article ${created ? 'created' : 'updated'}: ${instance.id}`);

      return ArticleMapper.toDomain(instance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to save article: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Recherche par ID d'article
   * @param id ID de l'article
   * @param options options de transaction
   * @returns article trouvé ou null
   */
  async findById (id: string, options?: TransactionOptions): Promise<ArticleDomain | null> {
    const article = await this.articleModel.findByPk(uuidToBuffer(id), {
      transaction: options?.transaction,
    });
    return article ? ArticleMapper.toDomain(article) : null;
  }

  /**
   * Recherche d'article par URL (pour vérifier les doublons)
   * @param sourceId
   * @param url URL de l'article
   * @param options options de transaction
   * @returns article trouvé ou null
   */
  async findByUrl (sourceId: string, url: string, options?: TransactionOptions): Promise<ArticleDomain | null> {
    const article = await this.articleModel.findOne({
      where: {sourceId: uuidToBuffer(sourceId), url: url},
      transaction: options?.transaction,
    });
    return article ? ArticleMapper.toDomain(article) : null;
  }

  /**
   * Récupérer la liste des articles selon les filtres
   * @param filterOptions options de filtrage
   * @param txOptions options de transaction
   * @returns liste des articles
   */
  async findAll (filterOptions?: ArticleFilterOptions, txOptions?: TransactionOptions): Promise<ArticleDomain[]> {
    const where = this.buildWhereClause(filterOptions);
    const order = this.buildOrderClause(filterOptions);

    const articles = await this.articleModel.findAll({
      where,
      limit: filterOptions?.limit,
      offset: filterOptions?.offset,
      order,
      transaction: txOptions?.transaction,
    });

    return ArticleMapper.toDomainList(articles);
  }

  /**
   * Récupérer des articles avec pagination et filtres
   * @param page numéro de page (à partir de 1)
   * @param pageSize taille de page
   * @param filterOptions options de filtrage
   * @param txOptions options de transaction
   * @returns liste paginée des articles
   */
  async findPaginated (
    page: number,
    pageSize: number,
    filterOptions?: ArticleFilterOptions,
    txOptions?: TransactionOptions,
  ): Promise<PaginatedArticles> {
    const where = this.buildWhereClause(filterOptions);
    const order = this.buildOrderClause(filterOptions);
    const offset = (page - 1) * pageSize;

    // Si "title" est fourni, utiliser article_indexes avec JOIN pour une recherche optimisée
    if (filterOptions?.title) {
      // Séparer le ou les mots-clés en mots
      const titles = this.getSplitAndLowerCase(filterOptions.title)
        .filter((word) => word.length > 1)
        .map((word) => word.substring(0, 50));

      if (titles.length > 0) {
        const {rows, count} = await this.articleModel.findAndCountAll({
          include: [{
            model: this.articleIndexModel,
            as: 'indexes',
            where: {
              titleFragment: {
                [Op.like]: titles.map((title) => `${title}%`),
              },
            },
            attributes: [],
            required: true,
          }],
          where,
          limit: pageSize,
          offset,
          order,
          distinct: true,
          subQuery: false,
          transaction: txOptions?.transaction,
        });

        const items = ArticleMapper.toDomainList(rows);
        const totalPages = Math.ceil(count / pageSize);

        return {
          items,
          total: count,
          page,
          pageSize,
          totalPages,
        };
      }
    }

    // Recherche par défaut en l'absence de recherche de titre
    const {rows, count} = await this.articleModel.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order,
      transaction: txOptions?.transaction,
    });

    const items = ArticleMapper.toDomainList(rows);
    const totalPages = Math.ceil(count / pageSize);

    return {
      items,
      total: count,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Enregistrement en masse d'articles (optimisation des performances)
   * @param articles liste des articles à enregistrer
   * @param options options de transaction
   * @returns liste des articles enregistrés
   */
  async saveBulk (articles: ArticleDomain[], options?: TransactionOptions): Promise<ArticleDomain[]> {
    try {
      if (articles.length === 0) {
        return [];
      }

      // Convertir les entités du domaine en données de persistance
      const data = articles.map((article) => ArticleMapper.toPersistence(article));

      // Insertion en masse avec bulkCreate (ignorer les doublons)
      const instances = await this.articleModel.bulkCreate(data as any[], {
        ignoreDuplicates: true,
        transaction: options?.transaction,
      });

      this.logger.log(`Bulk created ${instances.length} articles`);

      // Créer des index pour les articles générés
      for (const article of articles) {
        await this.createArticleIndexes(article.id, article.title, options);
      }

      // Convertir en entités de domaine et retourner
      return ArticleMapper.toDomainList(instances);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to bulk create articles: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Compter le nombre d'articles par ID de source
   * @param sourceId ID de la source
   * @param options options de transaction
   * @returns nombre d'articles
   */
  async countBySourceId (sourceId: string, options?: TransactionOptions): Promise<number> {
    return await this.articleModel.count({
      where: {sourceId: uuidToBuffer(sourceId)},
      transaction: options?.transaction,
    });
  }

  /**
   * Construire la clause WHERE à partir des options de filtre
   * @param options options de filtrage
   * @returns objet de clause WHERE
   */
  private buildWhereClause (options?: ArticleFilterOptions): any {
    const where: any = {};

    // Filtre par ID de source
    if (options?.sourceId) {
      where.sourceId = uuidToBuffer(options.sourceId);
    }

    // Publié après
    if (options?.publishedAfter) {
      where.publicationDate = {[Op.gte]: options.publishedAfter};
    }

    // Publié avant
    if (options?.publishedBefore) {
      where.publicationDate = {
        ...where.publicationDate,
        [Op.lte]: options.publishedBefore,
      };
    }

    return where;
  }

  /**
   * Construire la clause ORDER BY à partir des options de tri
   * @param options options de filtrage
   * @returns tableau de clause ORDER BY
   */
  private buildOrderClause (options?: ArticleFilterOptions): [string, string][] {
    const sortField = options?.sortField || 'publicationDate';
    const sortOrder = options?.sortOrder || 'DESC';

    // Convertir en noms de colonnes utilisés par Sequelize (camelCase → snake_case)
    const columnMap: Record<string, string> = {
      publicationDate: 'publication_date',
      createdAt: 'created_at',
      title: 'title',
    };

    const column = columnMap[sortField] || 'publication_date';
    return [[column, sortOrder]];
  }

  private static readonly REMOVE_LETTERS = [
    "and", "or", "but", "so", "because", "although", "if", "when", "after", "before", "since", "unless", "while", "as", "though", "until", "whereas", "once", "whether", "even", "now", "that", "of", "in", "at", "on", "for", "with", "about", "by", "to", "from", "et", "ou", "mais", "donc", "parce que", "lorsque", "si", "quand", "puisque", "bien que", "tandis que", "alors que", "comme", "de", "à", "avec", "dans", "sur", "pour", "par", "en", "chez", "sous"
  ]

  /**
   * Créer des index de mots-clés pour le titre de l'article
   * @param articleId ID de l'article
   * @param title titre de l'article
   * @param options options de transaction
   */
  private async createArticleIndexes (articleId: string, title: string, options?: TransactionOptions): Promise<void> {
    try {
      // Séparer le titre en mots
      const words = this.getSplitAndLowerCase(title)
        .filter((word) =>
          ArticleRepositoryAdapter.REMOVE_LETTERS.indexOf(word) === -1
        )
        .map((word) =>
          word
            .replace(/\W/g, '')
            .substring(0, 50)
        );

      // Supprimer les doublons
      const uniqueWords = [...new Set(words)];

      // Insertion en masse via bulkCreate
      if (uniqueWords.length > 0) {
        await this.articleIndexModel.bulkCreate(
          uniqueWords.map((word) => ({
            articleId,  // Le setter d'entité convertit automatiquement en Buffer
            titleFragment: word,
          })),
          {
            transaction: options?.transaction,
          },
        );

        this.logger.log(`Created ${uniqueWords.length} indexes for article ${articleId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create article indexes: ${errorMessage}`);
      throw error;
    }
  }

  private getSplitAndLowerCase = (txt: string) => {
    return txt
      .toLowerCase()
      .split(/[\s,.!?\-()\[\]{}]+/)
      .filter((word) => word.length > 1)
      ;
  }
}
