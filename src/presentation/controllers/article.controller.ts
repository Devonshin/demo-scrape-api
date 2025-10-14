/**
 * @author Dongwoo
 * @date 2025-10-13
 * Article Controller - Points de terminaison API relatifs aux articles
 */
import {Body, Controller, Get, HttpCode, HttpStatus, Inject, Logger, Post, Query,} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags,} from '@nestjs/swagger';
import {ScrapeRequestDto} from '../../application/dto/scrape-request.dto';
import {ScrapeResponseDto} from '../../application/dto/scrape-response.dto';
import {GetArticlesQueryDto} from '../../application/dto/get-articles-query.dto';
import {GetArticlesResponseDto} from '../../application/dto/get-articles-response.dto';
import {IScrapeArticlesUseCase} from '../../application/ports/in/scrape-articles.use-case';
import {IGetArticlesUseCase} from '../../application/ports/in/get-articles.use-case';
import {ArticleDtoMapper} from '../../infrastructure/adapters/persistence/mappers/article-dto.mapper';

/**
 * Points de terminaison API relatifs aux articles
 */
@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  private readonly logger = new Logger(ArticleController.name);

  constructor(
    @Inject('IScrapeArticlesUseCase')
    private readonly scrapeArticlesUseCase: IScrapeArticlesUseCase,
    @Inject('IGetArticlesUseCase')
    private readonly getArticlesUseCase: IGetArticlesUseCase,
  ) {}

  /**
   * GET /articles - Récupérer la liste des articles
   * @param query Paramètres de requête
   * @returns Liste d’articles paginée
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Liste des articles',
    description: `
      API de liste des articles avec pagination, filtrage et tri.
      - Pagination: utilisez les paramètres page et pageSize
      - Filtrage: sourceId, title, publishedAfter, publishedBefore
      - Tri: sortField, sortOrder
      - Recherche plein texte sur le titre: via le tableau article_indexes avec keyword
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Consultation réussie',
    type: GetArticlesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Requête invalide (échec de validation)',
  })
  async getArticles(
    @Query() query: GetArticlesQueryDto,
  ): Promise<GetArticlesResponseDto> {
    this.logger.log(`Get articles request`, query);

    // Exécuter le Use Case
    const result = await this.getArticlesUseCase.execute(query);

    // Créer le DTO de réponse
    const response: GetArticlesResponseDto = {
      articles: ArticleDtoMapper.toDtoList(result.articles),
      pagination: {
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious,
      },
    };

    this.logger.log(`Found ${result.total} articles (page ${result.currentPage}/${result.totalPages})`);

    return response;
  }

  /**
   * POST /articles/scrape - Exécuter un scraping manuel
   * @param request DTO de demande de scraping
   * @returns Résultat du scraping
   */
  @Post('scrape')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Running manual scraping',
    description: `
      Scrape articles from specified sources or all active sources.

      - If sourceId is specified, only the relevant source is scraped.
      - Scrape all active sources if sourceId is not specified
      - Setting uri for append uri to target domain.
      - If a date is specified, only articles of that date are scraped.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Scraping Success',
    type: ScrapeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (validation failed)',
  })
  @ApiResponse({
    status: 404,
    description: 'Source not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Server internal error',
  })
  async scrape(
    @Body() request: ScrapeRequestDto,
  ): Promise<ScrapeResponseDto> {
    this.logger.log(`Scrape request received`, request);
    const startedAt = new Date();

    try {
      // Exécuter le Use Case
      const summary = await this.scrapeArticlesUseCase.execute(request);

      const completedAt = new Date();
      const durationSeconds = (completedAt.getTime() - startedAt.getTime()) / 1000;

      // Créer le DTO de réponse
      const response: ScrapeResponseDto = {
        success: summary.failedSources === 0,
        totalSourcesScraped: summary.totalSourcesScraped,
        successfulSources: summary.successfulSources,
        failedSources: summary.failedSources,
        totalArticlesScraped: summary.totalArticlesScraped,
        newArticles: summary.totalArticlesScraped,
        duplicates: summary.duplicateArticles, // 0 car le Use Case saute la vérification des doublons
        errors: summary.errors.map((err) => ({
          sourceId: err.sourceId,
          sourceName: '', // Le nom de la source nécessite une requête séparée
          error: err.error,
        })),
        startedAt,
        completedAt,
        durationSeconds,
      };

      this.logger.log(`Scrape completed successfully`, {
        totalArticlesScraped: response.totalArticlesScraped,
        successfulSources: response.successfulSources,
        failedSources: response.failedSources,
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Scrape failed: ${errorMessage}`, error);
      throw error;
    }
  }
}
