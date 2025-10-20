/**
 * @author Dongwoo
 * @date 2025-10-13
 * Implémentation du cas d’utilisation de scraping d’articles
 */
import {Inject, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {ScrapeArticlesPort, ScrapeResultSummary,} from '../ports/in/scrape-articles.port';
import {ArticleRepositoryPort} from '../ports/out/repositories/article.repository.port';
import {SourceRepositoryPort} from '../ports/out/repositories/source.repository.port';
import {ScraperPort, ScrapeResult} from '../ports/out/scraper/scraper.port';
import {ArticleDomain} from '../../domain/entities/article.domain';
import {v4 as uuidv4} from 'uuid';
import {ScrapeRequestDto} from "../dtos/scrape-request.dto";
import {SourceDomain} from "../../domain/entities/source.domain";

/**
 * Implémentation du cas d’utilisation de scraping d’articles
 * Scraper des articles depuis des sources web et les enregistrer dans la base de données
 */
@Injectable()
export class ScrapeArticlesUseCase implements ScrapeArticlesPort {
  private readonly logger = new Logger(ScrapeArticlesUseCase.name);

  constructor (
    @Inject('ArticleRepositoryPort')
    private readonly articleRepository: ArticleRepositoryPort,
    @Inject('SourceRepositoryPort')
    private readonly sourceRepository: SourceRepositoryPort,
    @Inject('ScraperPort')
    private readonly scraper: ScraperPort,
  ) {
  }

  /**
   * Exécuter le scraping d’articles
   * @param command Commande de scraping
   * @returns Résumé des résultats de scraping
   */
  async execute (command: ScrapeRequestDto): Promise<ScrapeResultSummary> {
    const startTime = Date.now();
    this.logger.log('Starting scrape operation', command);

    // Récupérer la liste des sources à scraper
    const sources = await this.getTargetSources(command.sourceId);

    if (sources.length === 0) {
      throw new NotFoundException(
        command.sourceId
          ? `Source with ID ${command.sourceId} not found`
          : 'No active sources found'
      );
    }

    const summary: ScrapeResultSummary = {
      totalSourcesScraped: sources.length,
      totalArticlesScraped: 0,
      duplicateArticles: 0,
      successfulSources: 0,
      failedSources: 0,
      errors: [],
    };

    // Exécuter le scraping pour chaque source
    for (const source of sources) {
      try {
        this.logger.log(`Scraping source: [${source.title}] [${source.id}]`);

        // Effectuer le scraping
        const scrapeResult = await this.scraper.scrapeArticles(source, command.uri);

        if (!scrapeResult.success) {
          summary.failedSources++;
          summary.errors.push({
            sourceId: source.id,
            error: scrapeResult.error || 'Unknown error',
          });
          continue;
        }

        // Enregistrer les articles
        await this.saveArticles(scrapeResult, source, summary);
        summary.successfulSources++;
        this.logger.log(
          `Successfully scraped ${summary.totalArticlesScraped} articles from ${source.title}`,
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Failed to scrape source ${source.title}: ${errorMessage}`,
        );
        summary.failedSources++;
        summary.errors.push({
          sourceId: source.id,
          error: errorMessage,
        });
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    this.logger.log(`Scrape operation completed in ${duration}s`, summary);

    return summary;
  }

  // Enregistrer les articles
  private saveArticles =
    async (scrapeResult: ScrapeResult, source: SourceDomain, summary: ScrapeResultSummary) => {
      for (const scrapedArticle of scrapeResult.articles) {
        try {
          // Vérifier les doublons d’URL
          const existingArticle = await this.articleRepository.findByUrl(
            source.id,
            scrapedArticle.url,
          );

          // Créer un nouvel article
          const article = new ArticleDomain(
            existingArticle?.id || uuidv4(),
            source.id,
            scrapedArticle.title,
            scrapedArticle.url,
            scrapedArticle.summary || null,
            scrapedArticle.publicationDate || null,
            existingArticle?.createdAt || new Date(),
          );
          await this.articleRepository.save(article);
          if (existingArticle) {
            summary.duplicateArticles++;
          }
          summary.totalArticlesScraped++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(
            `Failed to save article: ${scrapedArticle.title} - ${errorMessage}`,
          );
        }
      }
    }

  /**
   * Récupérer la liste des sources cibles à scraper
   * @param sourceId ID de la source spécifique (optionnel)
   * @returns Liste des sources
   */
  private async getTargetSources (sourceId?: string) {
    if (sourceId) {
      // Ne récupérer que la source spécifiée
      const source = await this.sourceRepository.findById(sourceId);
      return source ? [source] : [];
    } else {
      // Récupérer toutes les sources actives
      return await this.sourceRepository.findAll();
    }
  }
}
