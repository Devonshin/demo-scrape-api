/**
 * @author Dongwoo
 * @date 2025-10-13
 * HTTP 클라이언트 유틸리티 - Rate limiting 및 재시도 로직 포함
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * HTTP 클라이언트 설정 옵션
 */
export interface HttpClientOptions {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  rateLimitMs?: number;
  userAgent?: string;
}

/**
 * Rate Limiter 클래스
 * 1초당 요청 횟수 제한
 */
class RateLimiter {
  private queue: Array<() => void> = [];
  private lastRequestTime = 0;

  constructor(private readonly intervalMs: number) {}

  async throttle(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest >= this.intervalMs) {
        this.lastRequestTime = now;
        resolve();
      } else {
        const delay = this.intervalMs - timeSinceLastRequest;
        setTimeout(() => {
          this.lastRequestTime = Date.now();
          resolve();
        }, delay);
      }
    });
  }
}

/**
 * HTTP 클라이언트 유틸리티
 * Rate limiting, 재시도, 타임아웃 기능 포함
 */
export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly rateLimiter: RateLimiter;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(options: HttpClientOptions = {}) {
    const {
      timeout = 10000,
      maxRetries = 3,
      retryDelay = 1000,
      rateLimitMs = 1000,
      userAgent = 'Mozilla/5.0 (compatible; NewsBot/1.0)',
    } = options;

    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.rateLimiter = new RateLimiter(rateLimitMs);

    this.axiosInstance = axios.create({
      timeout,
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });
  }

  /**
   * GET 요청 실행 (Rate limiting 및 재시도 포함)
   * @param url 요청 URL
   * @param config Axios 설정
   * @returns 응답 데이터
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.throttle();
      const response = await this.axiosInstance.get<T>(url, config);
      return response.data;
    });
  }

  /**
   * 재시도 로직을 포함한 요청 실행
   * @param fn 실행할 함수
   * @returns 함수 실행 결과
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // 마지막 시도인 경우 에러 발생
        if (attempt === this.maxRetries) {
          throw new Error(
            `Failed after ${this.maxRetries} attempts: ${lastError.message}`,
          );
        }

        // 재시도 전 대기
        await this.delay(this.retryDelay * attempt);
      }
    }

    throw lastError;
  }

  /**
   * 지연 함수
   * @param ms 밀리초
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
