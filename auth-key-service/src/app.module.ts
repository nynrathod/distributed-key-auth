import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
      DatabaseModule,AuthKeyModule, RedisModule, JwtAuthModule
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}
