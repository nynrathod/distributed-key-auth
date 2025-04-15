import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtGuard } from './jwt/jwt.guard';
import { ExceptionsFilter } from './exception-filters/exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ExceptionsFilter());
  app.useGlobalGuards(app.get(JwtGuard));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
