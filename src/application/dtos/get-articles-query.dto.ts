/**
 * @author Dongwoo
 * @date 2025-10-13
 * 기사 조회 쿼리 DTO
 */
import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsIn, IsInt, IsOptional, IsString, Max, Min} from 'class-validator';

/**
 * GET /articles 쿼리 파라미터 DTO
 */
export class GetArticlesQueryDto {
  /**
   * 페이지 번호 (1부터 시작)
   */
  @ApiProperty({
    description: 'Page number (starting from 1)',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * 페이지당 아이템 수
   */
  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  /**
   * 소스 ID 필터
   */
  @ApiProperty({
    description: 'View only articles from specific sources',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  sourceId?: string;

  /**
   * 제목 전문검색 키워드
   */
  @ApiProperty({
    description: 'Title full-text search keyword (using article_indexes table)',
    example: 'FontNinja',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * 발행일 이후 (이 날짜 포함)
   */
  @ApiProperty({
    description: 'After the date of publication (including this date)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  publishedAfter?: Date;

  /**
   * 발행일 이전 (이 날짜 포함)
   */
  @ApiProperty({
    description: 'Before the date of publication (including this date)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  publishedBefore?: Date;

  /**
   * 정렬 필드
   */
  @ApiProperty({
    description: 'Sort by field',
    example: 'publicationDate',
    required: false,
    default: 'publicationDate',
    enum: ['publicationDate', 'createdAt', 'title'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['publicationDate', 'createdAt', 'title'])
  sortField?: 'publicationDate' | 'createdAt' | 'title';

  /**
   * 정렬 순서
   */
  @ApiProperty({
    description: 'SORT ORDER',
    example: 'DESC',
    required: false,
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
