/**
 * @author Dongwoo
 * @date 2025-10-13
 * 헬스체크 컨트롤러 - 애플리케이션 상태 확인 엔드포인트
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, HealthStatus } from './health.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
/**
 * 헬스체크 컨트롤러
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * 애플리케이션 헬스 상태 조회
   * @returns 헬스 상태 정보
   */
  @ApiExcludeEndpoint()
  @Get()
  @ApiOperation({ summary: '애플리케이션 헬스 상태 조회' })
  @ApiResponse({
    status: 200,
    description: '헬스 상태 정보 반환',
  })
  getHealth(): HealthStatus {
    return this.healthService.getHealth();
  }

  /**
   * 간단한 라이브니스 체크 (Kubernetes용)
   * @returns 성공 메시지
   */
  @ApiExcludeEndpoint()
  @Get('liveness')
  @ApiOperation({ summary: '라이브니스 체크 (Kubernetes 용)' })
  @ApiResponse({
    status: 200,
    description: '애플리케이션이 실행 중임',
  })
  getLiveness(): { status: string } {
    return { status: 'alive' };
  }

  /**
   * 레디니스 체크 (Kubernetes용)
   * @returns 준비 상태 정보
   */
  @ApiExcludeEndpoint()
  @Get('readiness')
  @ApiOperation({ summary: '레디니스 체크 (Kubernetes 용)' })
  @ApiResponse({
    status: 200,
    description: '애플리케이션이 요청을 받을 준비가 됨',
  })
  getReadiness(): { status: string; ready: boolean } {
    // 메모리 사용량이 너무 높으면 준비되지 않음
    const isReady = !this.healthService.isMemoryUsageHigh();
    return {
      status: isReady ? 'ready' : 'not ready',
      ready: isReady,
    };
  }
}
