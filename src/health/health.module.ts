/**
 * @author Dongwoo
 * @date 2025-10-13
 */
import {Module} from '@nestjs/common';
import {HealthController} from './health.controller';
import {HealthService} from './health.service';

/**
 * Module HealthCheck
 */
@Module({
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
