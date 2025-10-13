/**
 * @author Dongwoo
 * @date 2025-10-13
 * 응답 변환 인터셉터 - 모든 성공 응답을 일관된 형식으로 래핑
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 표준화된 API 응답 인터페이스
 */
export interface Response<T> {
  /** HTTP 상태 코드 */
  statusCode: number;
  /** 응답 메시지 */
  message: string;
  /** 실제 데이터 */
  data: T;
  /** 응답 타임스탬프 */
  timestamp: string;
}

/**
 * An interceptor that converts all success responses into a consistent format.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  /**
   * intercept requests and transform responses
   * @param context - 실행 컨텍스트
   * @param next - 다음 핸들러
   * @returns 변환된 응답 Observable
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        message: 'Success',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
