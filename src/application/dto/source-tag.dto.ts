/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag DTO - API 요청/응답 데이터 전송 객체
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  MaxLength,
} from 'class-validator';

/**
 * 소스 태그 생성 요청 DTO
 */
export class CreateSourceTagDto {
  @ApiProperty({
    description: '소스 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  sourceId!: string;

  @ApiProperty({
    description: '필드명 (타겟 대상 이름)',
    example: 'title',
    enum: ['title', 'summary', 'date', 'link'],
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fieldName!: string;

  @ApiProperty({
    description: 'HTML 태그명',
    example: 'h1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tagName!: string;

  @ApiPropertyOptional({
    description: 'CSS 클래스명 (선택)',
    example: 'article-title',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  className?: string;
}

/**
 * 소스 태그 수정 요청 DTO
 */
export class UpdateSourceTagDto {
  @ApiProperty({
    description: '필드명 (타겟 대상 이름)',
    example: 'title',
    enum: ['title', 'summary', 'date', 'link'],
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fieldName!: string;

  @ApiProperty({
    description: 'HTML 태그명',
    example: 'h2',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tagName!: string;

  @ApiPropertyOptional({
    description: 'CSS 클래스명 (선택)',
    example: 'news-title',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  className?: string;
}

/**
 * 소스 태그 응답 DTO
 */
export class SourceTagResponseDto {
  @ApiProperty({
    description: '태그 ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: '소스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sourceId!: string;

  @ApiProperty({
    description: '필드명',
    example: 'title',
  })
  fieldName!: string;

  @ApiProperty({
    description: 'HTML 태그명',
    example: 'h1',
  })
  tagName!: string;

  @ApiProperty({
    description: 'CSS 클래스명',
    example: 'article-title',
    nullable: true,
  })
  className!: string | null;

  @ApiProperty({
    description: '생성 일시',
    example: '2025-01-13T10:00:00Z',
  })
  createdAt!: Date;
}
