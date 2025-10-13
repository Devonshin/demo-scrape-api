/**
 * @author Dongwoo
 * @date 2025-10-13
 * DTO de demande de scraping
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

/**
 * DTO de requête POST /scrape
 */
export class ScrapeRequestDto {
  /**
   * ID de source spécifique (optionnel)
   * Si non spécifié, toutes les sources actives seront scrappées
   */
  @ApiProperty({
    description: 'ID de la source à scraper (optionnel, si non spécifié toutes les sources actives)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  sourceId?: string;

  /**
   * Indicateur de rafraîchissement forcé
   * Si vrai, ignore la dernière heure de scraping et force l’exécution
   */
  @ApiProperty({
    description: 'Rafraîchissement forcé (ignore la dernière heure de scraping)',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;

  /**
   * Date à scraper (optionnel)
   * Ne scraper que les articles de la date spécifiée
   */
  @ApiProperty({
    description: 'Date à scraper (format YYYY-MM-DD, optionnel)',
    example: '2025-10-13',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
