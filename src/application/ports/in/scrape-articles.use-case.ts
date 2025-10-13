/**
 * @author Dongwoo
 * @date 2025-10-13
 * Interface du cas d’utilisation de scraping d’articles - port entrant
 */

/**
 * DTO de commande de scraping d’articles
 */
export interface ScrapeArticlesCommand {
  sourceId?: string; // Ne scraper qu’une source spécifique (si non spécifié, toutes les sources actives)
  forceRefresh?: boolean; // Forcer l’exécution en ignorant la dernière heure de scraping
}

/**
 * Résumé des résultats de scraping
 */
export interface ScrapeResultSummary {
  totalSourcesScraped: number;
  totalArticlesScraped: number;
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
  execute(command: ScrapeArticlesCommand): Promise<ScrapeResultSummary>;
}
