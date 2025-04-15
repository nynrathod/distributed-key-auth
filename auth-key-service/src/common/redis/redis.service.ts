import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import Redis from 'ioredis';
import { AuthKeyService } from '../../auth-key/auth-key.service';
import { REDIS_CHANNELS } from './redis.constants';

@Injectable()
export class RedisService implements OnApplicationBootstrap {
  private redisPublisher: Redis;
  private redisSubscriber: Redis;
  private redisCache: Redis;
  private logger = new Logger(RedisService.name);

  constructor(
    @Inject(forwardRef(() => AuthKeyService))
    private readonly authKeyService: AuthKeyService,
  ) {
    this.logger.log('RedisService instance created');

    // Initialize Redis clients
    this.redisPublisher = new Redis({ host: 'localhost', port: 6379 });
    this.redisSubscriber = new Redis({ host: 'localhost', port: 6379 });
    this.redisCache = new Redis({ host: 'localhost', port: 6379 });

    // Setup event listeners for Redis connections
    this.redisPublisher.on('connect', () => {
      this.logger.log('Redis publisher connected successfully!');
    });
    this.redisSubscriber.on('connect', () => {
      this.logger.log('Redis subscriber connected successfully!');
    });

    // Log errors
    this.redisPublisher.on('error', (err) => {
      this.logger.error('Redis publisher error: ' + err.message);
    });
    this.redisSubscriber.on('error', (err) => {
      this.logger.error('Redis subscriber error: ' + err.message);
    });
  }

  async getCache(key: string): Promise<string | null> {
    this.logger.log(`Fetching cache for key: ${key}`);
    return this.redisCache.get(key);
  }

  async setCache(
    key: string,
    value: string,
    expiration?: number,
  ): Promise<void> {
    this.logger.log(`Setting cache for key: ${key} with value: ${value}`);
    try {
      if (expiration) {
        await this.redisCache.setex(key, expiration, value);
      } else {
        await this.redisCache.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set cache for ${key}: ${error.message}`);
    }
  }

  async incrCache(key: string): Promise<number> {
    this.logger.log(`Incrementing cache for key: ${key}`);
    try {
      return await this.redisCache.incr(key);
    } catch (error) {
      this.logger.error(
        `Failed to increment cache for ${key}: ${error.message}`,
      );
      return 0; // Return 0 if increment fails to avoid breaking the app
    }
  }

  async onApplicationBootstrap() {
    this.logger.log('onApplicationBootstrap triggered');
    // Subscribe to multiple channels
    await this.subscribe([REDIS_CHANNELS.REQUEST_KEY_INFO]);
  }

  // Publish message using the publisher client
  async publish(channel: string, message: string) {
    if (!channel || !message) {
      this.logger.error('Invalid arguments: channel or message is missing.');
      return;
    }

    try {
      await this.redisPublisher.publish(channel, message);
      this.logger.log(`Message published to ${channel}: ${message}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish message to ${channel}: ${error.message}`,
      );
    }
  }

  // Subscribe using the subscriber client
  async subscribe(channels: string[]) {
    if (!channels || channels.length === 0) {
      this.logger.error('No channels provided.');
      return;
    }

    for (const channel of channels) {
      try {
        await this.redisSubscriber.subscribe(channel);
        this.logger.log(`Subscribed to channel: ${channel}`);
      } catch (error) {
        this.logger.error(
          `Failed to subscribe to ${channel}: ${error.message}`,
        );
      }
    }

    // Listen for incoming messages on the subscriber client
    this.redisSubscriber.on('message', (channel, message) => {
      this.logger.log(`Received message on channel ${channel}: ${message}`);
      this.processMessage(channel, message);
    });
  }

  private processMessage(channel: string, message: string) {
    this.logger.log(`Processing message from channel ${channel}: ${message}`);
    try {
      const event = JSON.parse(message);

      switch (channel) {
        case 'request_key_info':
          this.handleAccessKeyEvent(event);
          break;

        default:
          this.logger.warn(`No handler for channel ${channel}`);
      }
    } catch (err) {
      this.logger.error(
        `Error parsing message from ${channel}: ${err.message}`,
      );
    }
  }

  private async handleAccessKeyEvent(event: any) {
    this.logger.log(`Handling access request: ${JSON.stringify(event)}`);

    try {
      const userInfo = await this.authKeyService.getUserDetails(
        event.accessKey,
      );
      this.publish('receive_key_info', JSON.stringify(userInfo));
    } catch (err) {
      this.logger.error(`Error handling access key event: ${err.message}`);
    }
  }
}
