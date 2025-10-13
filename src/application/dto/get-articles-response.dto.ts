/**
 * @author Dongwoo
 * @date 2025-10-13
 * Article View Response DTO
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * article DTO
 */
export class ArticleDto {
  @ApiProperty({
    description: 'article ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'source ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  sourceId!: string;

  @ApiProperty({
    description: 'article title',
    example: 'OpenAI releases GPT-5',
  })
  title!: string;

  @ApiProperty({
    description: 'url',
    example: 'https://example.com/article',
  })
  url!: string;

  @ApiProperty({
    description: 'Date of publication',
    example: '2025-10-13T12:00:00Z',
  })
  publicationDate!: Date;

  @ApiProperty({
    description: 'Creation date of Scrapping',
    example: '2025-10-13T12:00:00Z',
  })
  createdAt!: Date;
}

/**
 * Pagination metadata
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'CURRENT PAGE',
    example: 1,
  })
  currentPage!: number;

  @ApiProperty({
    description: 'PAGE SIZE',
    example: 20,
  })
  pageSize!: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 200,
  })
  totalItems!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Next page exists',
    example: true,
  })
  hasNext!: boolean;

  @ApiProperty({
    description: 'Previous page exists',
    example: false,
  })
  hasPrevious!: boolean;
}

/**
 * GET /articles 응답 DTO
 */
export class GetArticlesResponseDto {
  @ApiProperty({
    description: 'Article List',
    type: [ArticleDto],
  })
  articles!: ArticleDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  pagination!: PaginationMetaDto;
}
