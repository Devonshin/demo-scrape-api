/**
 * @author Dongwoo
 * @date 2025-10-13
 * Interface du cas d’utilisation de scraping d’articles - port entrant
 */

import {ScrapeRequestDto} from "../../dto/scrape-request.dto";

/**
 * Résumé des résultats de scraping
 */
export interface ScrapeResultSummary {
  totalSourcesScraped: number;
  totalArticlesScraped: number;
  duplicateArticles: number;
  successfulSources: number;
  failedSources: number;
  errors: Array<{ sourceId: string; error: string }>;
}

/**
 * Interface du cas d’utilisation de scraping d’articles
 * Point d’entrée de la couche application pour scraper des articles du web et les stocker
 */
export interface IScrapeArticlesUseCase {
  /**
   * Exécuter le scraping d’articles
   * @param command Commande de scraping
   * @returns Résumé des résultats de scraping
   */
  execute (command: ScrapeRequestDto): Promise<ScrapeResultSummary>;
}
