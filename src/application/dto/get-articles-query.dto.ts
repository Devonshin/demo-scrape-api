/**
 * @author Dongwoo
 * @date 2025-10-13
 * 기사 조회 쿼리 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsIn, IsDateString } from 'class-validator';

/**
 * GET /articles 쿼리 파라미터 DTO
 */
export class GetArticlesQueryDto {
  /**
   * 페이지 번호 (1부터 시작)
   */
  @ApiProperty({
    description: '페이지 번호 (1부터 시작)',
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
    description: '페이지당 아이템 수',
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
    description: '특정 소스의 기사만 조회',
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
    description: '제목 전문검색 키워드 (article_indexes 테이블 활용)',
    example: 'AI 기술',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * 발행일 이후 (이 날짜 포함)
   */
  @ApiProperty({
    description: '발행일 이후 (이 날짜 포함)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  publishedAfter?: Date;

  /**
   * 발행일 이전 (이 날짜 포함)
   */
  @ApiProperty({
    description: '발행일 이전 (이 날짜 포함)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  publishedBefore?: Date;

  /**
   * 정렬 필드
   */
  @ApiProperty({
    description: '정렬 기준 필드',
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
    description: '정렬 순서',
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
