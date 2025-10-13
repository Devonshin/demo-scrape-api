/**
 * @author Dongwoo
 * @date 2025-10-13
 * 헬스체크 서비스 - 애플리케이션 상태 및 성능 메트릭 수집
 */
import { Injectable } from '@nestjs/common';

/**
 * 시스템 메모리 정보 인터페이스
 */
export interface MemoryInfo {
  /** 총 메모리 (bytes) */
  total: number;
  /** 사용 중인 메모리 (bytes) */
  used: number;
  /** 사용 가능한 메모리 (bytes) */
  free: number;
  /** 메모리 사용률 (%) */
  usagePercent: number;
}

/**
 * 애플리케이션 상태 정보 인터페이스
 */
export interface HealthStatus {
  /** 애플리케이션 상태 */
  status: 'healthy' | 'unhealthy';
  /** 현재 타임스탬프 */
  timestamp: string;
  /** 가동 시간 (초) */
  uptime: number;
  /** 메모리 정보 */
  memory: MemoryInfo;
  /** Node.js 버전 */
  nodeVersion: string;
  /** 환경 */
  environment: string;
}

/**
 * 헬스체크 서비스
 */
@Injectable()
export class HealthService {
  private readonly startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * 애플리케이션 헬스 상태를 반환
   * @returns 헬스 상태 정보
   */
  getHealth(): HealthStatus {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const freeMemory = totalMemory - usedMemory;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: Math.round((usedMemory / totalMemory) * 100),
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * 메모리 사용량이 임계값을 초과하는지 확인
   * @param threshold - 임계값 (기본: 90%)
   * @returns 임계값 초과 여부
   */
  isMemoryUsageHigh(threshold: number = 90): boolean {
    const health = this.getHealth();
    return health.memory.usagePercent > threshold;
  }
}
