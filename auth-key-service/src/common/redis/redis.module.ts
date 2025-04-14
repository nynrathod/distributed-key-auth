    // src/common/redis/redis.module.ts
    import { Module } from '@nestjs/common';
    import { RedisService } from './redis.service';

    @Module({
        providers: [RedisService],
        exports: [RedisService],  // Export RedisService so other modules can use it
    })
    export class RedisModule {}
