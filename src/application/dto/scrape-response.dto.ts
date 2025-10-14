/**
 * @author Dongwoo
 * @date 2025-10-13
 * 스크래핑 응답 DTO
 */
import {ApiProperty} from '@nestjs/swagger';

/**
 * 스크래핑 오류 정보
 */
export class ScrapeErrorDto {
  @ApiProperty({
    description: '오류가 발생한 소스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sourceId!: string;

  @ApiProperty({
    description: '소스 이름',
    example: '조선일보',
  })
  sourceName!: string;

  @ApiProperty({
    description: '오류 메시지',
    example: 'Network timeout',
  })
  error!: string;
}

/**
 * POST /scrape 응답 DTO
 */
export class ScrapeResponseDto {
  @ApiProperty({
    description: '스크래핑 성공 여부',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: '스크래핑을 시도한 총 소스 수',
    example: 3,
  })
  totalSourcesScraped!: number;

  @ApiProperty({
    description: '성공적으로 스크래핑한 소스 수',
    example: 2,
  })
  successfulSources!: number;

  @ApiProperty({
    description: '실패한 소스 수',
    example: 1,
  })
  failedSources!: number;

  @ApiProperty({
    description: '스크래핑한 총 기사 수',
    example: 50,
  })
  totalArticlesScraped!: number;

  @ApiProperty({
    description: '새로 추가된 기사 수',
    example: 45,
  })
  newArticles!: number;

  @ApiProperty({
    description: '중복된 기사 수',
    example: 5,
  })
  duplicates!: number;

  @ApiProperty({
    description: '발생한 오류 목록',
    type: [ScrapeErrorDto],
    required: false,
  })
  errors?: ScrapeErrorDto[];

  @ApiProperty({
    description: '스크래핑 시작 시간',
    example: '2025-10-13T12:00:00Z',
  })
  startedAt!: Date;

  @ApiProperty({
    description: '스크래핑 완료 시간',
    example: '2025-10-13T12:05:00Z',
  })
  completedAt!: Date;

  @ApiProperty({
    description: '소요 시간 (초)',
    example: 300,
  })
  durationSeconds!: number;
}
