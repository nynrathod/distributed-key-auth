import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './common/redis/redis.service';  // Import RedisService

@Controller()
export class AppController {
  constructor(
      private readonly appService: AppService,
      private readonly redisService: RedisService,  // Inject RedisService
  ) {}

  @Get()
  async getHello(): Promise<string> {
    // Example of publishing a message to a Redis channel
    const channel = '';
    const message = '';

    // Call the publish method from RedisService
    await this.redisService.publish(channel, message);

    return this.appService.getHello();
  }
}
