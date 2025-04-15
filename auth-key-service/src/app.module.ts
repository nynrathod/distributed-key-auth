import { Module } from '@nestjs/common';

import { AuthKeyModule } from './auth-key/auth-key.module';
import { RedisModule } from './common/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { JwtAuthModule } from './jwt/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    AuthKeyModule,
    JwtAuthModule,
  ],
})
export class AppModule {}
