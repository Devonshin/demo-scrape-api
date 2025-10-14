/**
 * @author Dongwoo
 * @date 2025-10-13
 * 헬스체크 모듈 - 애플리케이션 상태 모니터링
 */
import {Module} from '@nestjs/common';
import {HealthController} from './health.controller';
import {HealthService} from './health.service';

/**
 * 헬스체크 모듈
 */
@Module({
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
