/**
 * @author Dongwoo
 * @date 2025-10-13
 * DTO de demande de scraping
 */
import {ApiProperty} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

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
  sourceId!: string;

  /**
   * URI spécifique pour la source
   */
  @ApiProperty({
    description: 'Enregistrer URI spécifique',
    example: 'page=3',
    required: false,
  })
  @IsOptional()
  @IsString()
  uri?: string;
}
