/**
 * @author Dongwoo
 * @date 2025-10-13
 * @updated 2025-01-13 - Ajout du support pour les sélecteurs dynamiques
 * Implémentation d’un scraper web - implémentation de IScraperPort
 * Effectue le scraping de manière dynamique sur la base des informations de balises configurées en base de données.
 */
import {Inject, Injectable, Logger} from '@nestjs/common';
import * as cheerio from 'cheerio';
import {IScraperPort, ScrapedArticle, ScrapeResult,} from '../../../application/ports/out/scraper.port';
import {HttpClient} from '../web/http-client.util';
import {SourceDomain} from "../../../domain/entities/source.domain";
import {ISourceTagRepository} from '../../../domain/repositories/source-tag.repository.interface';

/**
 * Scraper web dynamique
 * Réalise le scraping d’articles de diverses sources sur la base des configurations de balises (SourceTag) stockées en
 * base de données.
 */
@Injectable()
class Scraper implements IScraperPort {

  private readonly logger = new Logger(Scraper.name);
  private readonly httpClient: HttpClient;

  constructor (
    @Inject('ISourceTagRepository')
    private readonly sourceTagRepository: ISourceTagRepository,
  ) {
    this.httpClient = new HttpClient({
      timeout: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      rateLimitMs: 1000,
      userAgent: 'Mozilla/5.0 (compatible; NewsBot/1.0)',
    });
  }

  // Extraire les expressions régulières en constantes de classe
  private static readonly MULTIPLE_SLASHES_REGEX = /\/{2,}/g;
  private static readonly MULTIPLE_QUESTION_MARKS_REGEX = /\?{2,}/g;

  /**
   * Scraper la liste des articles depuis une source
   * @param source Entité de domaine de la source (incluant targetUrl et id)
   * @param uri
   * @returns Résultat de scraping
   */
  async scrapeArticles (source: SourceDomain, uri: string | undefined = ''): Promise<ScrapeResult> {
    const scrapedAt = new Date();

    try {
      const crawlingUrl =
        `${source.targetUrl}/${uri.length > 0 ? ('?' + uri) : ''}`
          .replace(Scraper.MULTIPLE_SLASHES_REGEX, '/')
          .replace(Scraper.MULTIPLE_QUESTION_MARKS_REGEX, '?');
      this.logger.log(`Starting scrape for ${crawlingUrl}`);
      // Récupérer les informations de balises pour la source
      const sourceTags = await this.sourceTagRepository.findBySourceId(source.id);
      if (!sourceTags || sourceTags.length === 0) {
        this.logger.warn(`No tags found for source ${source.id}`);
        return {
          success: false,
          sourceId: source.id,
          articles: [],
          scrapedAt: scrapedAt,
          error: 'No tags configured for this source',
        };
      }

      // Mapper la configuration des balises par field_name
      const tagMap = new Map<string, string>();
      sourceTags.forEach(tag => {
        const selector = tag.generateSelector();
        tagMap.set(tag.fieldName, selector);
        this.logger.debug(`Mapped field '${tag.fieldName}' to selector '${selector}'`);
      });

      // Récupérer le HTML
      const html = await this.httpClient.get<string>(crawlingUrl);
      // Analyser le HTML avec Cheerio
      const $ = cheerio.load(html);
      const articles: ScrapedArticle[] = [];
      const processedUrls = new Set<string>();

      // Extraire la liste des articles avec des sélecteurs dynamiques
      const articleListSelector = source.mainWrapper;
      this.logger.log(`Using article list selector: ${articleListSelector}`);

      $(articleListSelector).each((index, element) => {
        try {
          const $element = $(element);

          // Extraire les données par champ
          const title = this.extractField($element, tagMap, 'title', 'text');
          const url = this.extractField($element, tagMap, 'link', 'href');

          // Valider les champs obligatoires
          if (!title || !url) {
            this.logger.debug(`Skipping article at index ${index}: missing title or url`);
            return; // continuer
          }

          // Convertir l’URL relative en URL absolue
          const absoluteUrl = this.normalizeUrl(url, source.targetUrl);

          // Vérifier les URL en double
          if (processedUrls.has(absoluteUrl)) {
            this.logger.debug(`Skipping duplicate URL: ${absoluteUrl}`);
            return; // continuer
          }
          processedUrls.add(absoluteUrl);

          // Extraire les champs optionnels
          const publicationDate = this.extractDateField($element, tagMap);
          const summary = this.extractField($element, tagMap, 'summary', 'text');

          // Créer l’objet article
          const article: ScrapedArticle = {
            title,
            url: absoluteUrl,
            publicationDate: publicationDate || undefined,
          };

          // Ajouter le résumé (si présent)
          if (summary) {
            // En supposant que l’interface ScrapedArticle possède un champ summary
            // Sinon, supprimer cette partie
            this.logger.debug(`Extracted summary for article: ${title.substring(0, 50)}...`);
          }

          articles.push(article);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(`Failed to parse article at index ${index}: ${errorMessage}`);
          return; // dans le callback each(), utiliser return au lieu de continue
        }
      });

      this.logger.log(`Successfully scraped ${articles.length} articles from ${source}`);

      return {
        sourceId: source.id,
        articles: articles,
        success: true,
        scrapedAt: scrapedAt,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to scrape ${source}: ${errorMessage}`);
      return {
        success: false,
        sourceId: source.id,
        articles: [],
        scrapedAt: scrapedAt,
        error: errorMessage,
      };
    }
  }

  /**
   * Vérifier la possibilité de scraping
   * @param url URL à vérifier
   * @returns Possibilité de scraping
   */
  async canScrape (url: string): Promise<boolean> {
    try {
      // Vérifier la validité de l’URL via une requête HTTP
      const response = await this.httpClient.get(url);
      return response !== undefined;
    } catch (error) {
      this.logger.warn(`Error checking URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Normaliser une URL en URL absolue
   * @param url URL source
   * @param baseUrl URL de base (extraite de targetUrl de la source)
   * @returns URL normalisée
   */
  private normalizeUrl (url: string, baseUrl: string): string {
    try {
      // Si c’est déjà une URL absolue
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }

      // Extraire le protocole et le domaine depuis baseUrl
      const urlObj = new URL(baseUrl);
      const origin = urlObj.origin; // https://example.com

      // Pour une URL relative, la combiner avec l’origin
      if (url.startsWith('/')) {
        return `${origin}${url}`;
      }

      return `${origin}/${url}`;
    } catch (error) {
      this.logger.warn(`Failed to normalize URL: ${url}, baseUrl: ${baseUrl}`);
      return url;
    }
  }

  /**
   * Extraire les données d’un champ
   * @param $element Élément Cheerio
   * @param tagMap Carte des sélecteurs par champ
   * @param fieldName Nom du champ
   * @param extractType Type d’extraction ('text' | 'href' | 'src')
   * @returns Donnée extraite ou null
   */
  private extractField (
    $element: cheerio.Cheerio<any>,
    tagMap: Map<string, string>,
    fieldName: string,
    extractType: 'text' | 'href' | 'src',
  ): string | null {
    try {
      if (!tagMap.has(fieldName)) {
        return null;
      }
      let $field: cheerio.Cheerio<any> | undefined;
      const selector = tagMap.get(fieldName)!;
      if (selector && selector.startsWith("__NEXT__")) {
        $field = $element.next().find(selector.replace("__NEXT__", ""))
      } else {
        $field = selector ? $element.find(selector) : $element;
      }

      if (!$field || $field.length === 0) {
        this.logger.debug(`No element found for field '${fieldName}' with selector '${selector}'`);
        return null;
      }

      let value: string | undefined;
      switch (extractType) {
        case 'text':
          value = $field.text().trim();
          break;
        case 'href':
          value = $field.attr('href');
          break;
        case 'src':
          value = $field.attr('src');
          break;
      }

      return value || null;
    } catch (error) {
      this.logger.warn(`Failed to extract field '${fieldName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Extraire le champ de date
   * @param $element Élément Cheerio
   * @param tagMap Carte des sélecteurs par champ
   * @returns Date analysée ou null
   */
  private extractDateField (
    $element: cheerio.Cheerio<any>,
    tagMap: Map<string, string>,
  ): Date | null {
    try {
      if (!tagMap.has('publication_date')) {
        return null;
      }

      const selector = tagMap.get('publication_date')!;
      let $dateElement: cheerio.Cheerio<any> | undefined;
      if (selector && selector.startsWith("__NEXT__")) {
        $dateElement = $element.next().find(selector.replace("__NEXT__", ""))
      } else {
        $dateElement = $element.find(selector);
      }

      if ($dateElement.length === 0) {
        return null;
      }

      // Tenter d’extraire la chaîne de date à partir de divers attributs
      const dateString =
        $dateElement.attr('datetime') ||
        $dateElement.attr('title') ||
        $dateElement.attr('data-timestamp') ||
        $dateElement.text().trim();

      return this.parseDate(dateString);
    } catch (error) {
      this.logger.warn(`Failed to extract date field: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /* Analyse de chaîne de date
  * @param dateString Chaîne de date
  * @returns Date analysée ou null
  */
  private readonly _TIME_UNITS = {
    min: 60 * 1000,
    mins: 60 * 1000,
    minute: 60 * 1000,
    minutes: 60 * 1000,
    hr: 60 * 60 * 1000,
    hrs: 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    mnth: 30 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
    yrs: 365 * 24 * 60 * 60 * 1000,
    years: 365 * 24 * 60 * 60 * 1000
  } as const;

  private parseRelativeTime (timeStr: string): Date | null {
    try {
      // 정규식에 'hr' 추가
      const match = timeStr.match(/(\d+)\s*(min|mins|minute|minutes|hr|hrs|hour|hours|day|days|month|mnth|months|yrs|year|years)\s*ago/);
      if (!match) {
        return null;
      }

      const value = parseInt(match[1], 10);
      const unit = match[2] as keyof typeof this._TIME_UNITS;
      const msAgo = this._TIME_UNITS[unit] * value;

      return new Date(Date.now() - msAgo);
    } catch (error) {
      this.logger.debug(`Failed to parse relative time: ${timeStr}`);
      return null;
    }
  }

  private parseDate (dateString: string): Date | null {
    try {
      if (!dateString || dateString.trim() === '') {
        return null;
      }

      // Try parsing relative time first
      const relativeDate = this.parseRelativeTime(dateString);
      if (relativeDate) {
        return relativeDate;
      }

      const date = new Date(dateString.split(' ')[0]);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      this.logger.debug(`Failed to parse date: ${dateString}`);
      return null;
    }
  }
}

export default Scraper
