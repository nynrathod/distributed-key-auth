import { RedisService } from './redis.service';
import { AuthKeyModule } from '../../auth-key/auth-key.module';
import { forwardRef, Logger, Module } from '@nestjs/common';

Logger.log('RedisModule initialized', 'RedisModule');

@Module({
  imports: [forwardRef(() => AuthKeyModule)],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
