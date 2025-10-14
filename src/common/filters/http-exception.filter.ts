/**
 * @author Dongwoo
 * @date 2025-10-13
 * HTTP 예외 필터 - 모든 HTTP 예외를 일관된 형식으로 응답
 */
import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {Request, Response} from 'express';

/**
 * HTTP 예외를 잡아서 일관된 형식의 에러 응답을 반환하는 필터
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * 예외를 처리하고 클라이언트에게 응답을 반환
   * @param exception - 발생한 HTTP 예외
   * @param host - ArgumentsHost 컨텍스트
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 에러 메시지 추출
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message?: string | string[] }).message || 'An error occurred';

    // 에러 응답 형식
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
    };

    // 에러 로깅 (개발 환경에서만 상세 로그)
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
        exception.stack,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url}`, JSON.stringify(errorResponse));
    }

    response.status(status).json(errorResponse);
  }
}
