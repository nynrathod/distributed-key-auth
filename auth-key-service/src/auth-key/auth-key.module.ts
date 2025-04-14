// src/auth-key/auth-key.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthKeyService } from './auth-key.service';
import { AuthKeyController } from './auth-key.controller';
import { AuthKey } from './entities/auth-key.entity';
import { RedisService } from '../common/redis/redis.service';


@Module({
  imports: [TypeOrmModule.forFeature([AuthKey])],
  controllers: [AuthKeyController],
  providers: [AuthKeyService, RedisService],
})
export class AuthKeyModule {}
