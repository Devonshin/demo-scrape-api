/**
 * @author Dongwoo
 * @date 2025-10-13
 * 로깅 인터셉터 - 요청과 응답 정보를 로깅
 */
import {CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

/**
 * 모든 HTTP 요청과 응답을 로깅하는 인터셉터
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * 요청을 가로채서 로깅
   * @param context - 실행 컨텍스트
   * @param next - 다음 핸들러
   * @returns 로깅이 추가된 응답 Observable
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    // 요청 정보 로깅
    this.logger.log(`[Request] ${method} ${url} - Body: ${JSON.stringify(body)}`);

    return next.handle().pipe(
      tap({
        next: (data): void => {
          // 응답 시간 계산 및 로깅
          const responseTime = Date.now() - now;
          this.logger.log(
            `[Response] ${method} ${url} - ${responseTime}ms - Data: ${JSON.stringify(data)}`,
          );
        },
        error: (error): void => {
          // 에러 발생 시 로깅
          const responseTime = Date.now() - now;
          this.logger.error(
            `[Error] ${method} ${url} - ${responseTime}ms - Error: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
