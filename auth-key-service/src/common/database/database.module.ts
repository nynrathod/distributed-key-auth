import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
console.log('🧾 Entity path:', __dirname + '/../**/*.entity{.ts,.js}');

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'auth-key',
      autoLoadEntities: true,
      synchronize: true,
      entities: [path.join(__dirname, '../../**/entities/*.entity.{ts,js}')],
      logging: true,
    }),
  ],
})
export class DatabaseModule {}
