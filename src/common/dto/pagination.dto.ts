/**
 * @author Dongwoo
 * @date 2025-10-13
 * DTO de pagination - logique de pagination commune
 */
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO de requête de pagination
 */
export class PaginationDto {
  /** 페이지 번호 (1부터 시작) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /** 페이지당 항목 수 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

/**
 * 페이지네이션 응답 메타데이터
 */
export interface PaginationMeta {
  /** 현재 페이지 번호 */
  currentPage: number;
  /** 페이지당 항목 수 */
  itemsPerPage: number;
  /** 전체 항목 수 */
  totalItems: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 이전 페이지 존재 여부 */
  hasPrevious: boolean;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
}

/**
 * 페이지네이션 응답 DTO
 */
export class PaginatedResponseDto<T> {
  /** 데이터 배열 */
  items: T[];
  /** 페이지네이션 메타데이터 */
  meta: PaginationMeta;

  constructor(items: T[], totalItems: number, page: number, limit: number) {
    this.items = items;
    this.meta = {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasPrevious: page > 1,
      hasNext: page < Math.ceil(totalItems / limit),
    };
  }
}
