import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthKeyService } from './auth-key.service';
import { AuthKeyController } from './auth-key.controller';
import { AuthKey } from './entities/auth-key.entity';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthKey]),

    // Forward reference to RedisModule to handle circular dependency
    forwardRef(() => RedisModule),
  ],
  controllers: [AuthKeyController],
  providers: [AuthKeyService],
  exports: [AuthKeyService],
})
export class AuthKeyModule {}
