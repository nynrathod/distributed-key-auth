import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionsFilter } from './exception-filter';
import { JwtGuard } from './jwt/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ExceptionsFilter());
  app.useGlobalGuards(app.get(JwtGuard));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
