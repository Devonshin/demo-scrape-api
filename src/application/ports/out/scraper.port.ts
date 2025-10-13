/**
 * @author Dongwoo
 * @date 2025-10-13
 * Interface de port Scraper - port sortant pour les fonctionnalités de web scraping
 */

import {SourceDomain} from "../../../domain/entities/source.domain";

/**
 * Données d’article scrappé
 */
export interface ScrapedArticle {
  title: string;
  url: string;
  publicationDate?: Date;
}

/**
 * Résultat de scraping
 */
export interface ScrapeResult {
  sourceId: string;
  articles: ScrapedArticle[];
  success: boolean;
  error?: string;
  scrapedAt: Date;
}

/**
 * Interface de port Scraper
 * Contrat de scraping à implémenter par la couche infrastructure
 */
export interface IScraperPort {
  /**
   * Scraper des articles à partir d’une source spécifique
   * @param source URL de la source
   * @returns Résultat de scraping
   */
  scrapeArticles (source: SourceDomain): Promise<ScrapeResult>;

  /**
   * Vérifier si le scraping est possible
   * @param url URL à vérifier
   * @returns Possibilité de scraping
   */
  canScrape(url: string): Promise<boolean>;
}
