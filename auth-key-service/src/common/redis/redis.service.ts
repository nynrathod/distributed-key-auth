import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private redisClient: Redis;
    private logger = new Logger(RedisService.name);

    constructor() {
        // Initialize Redis client
        this.redisClient = new Redis({
            host: 'localhost',
            port: 6379,
        });

        // Redis connection event listeners for handling connection-level errors
        this.redisClient.on('connect', () => {
            this.logger.log('Redis connected successfully!');
        });

        // Catch Redis client errors globally (network issues, connection issues)
        this.redisClient.on('error', (err) => {
            this.logger.error('Redis error: ' + err.message);
        });
    }

    // Publish message to Redis channel
    async publish(channel: string, message: string) {
        // Avoid wrapping the whole method in try-catch.
        // Let Redis handle network or connection errors via the event listener.
        if (!channel || !message) {
            this.logger.error('Invalid arguments: channel or message is missing.');
            return; // Avoid publishing if args are invalid
        }

        // We don't expect 'publish' to fail unless Redis is disconnected or invalid args.
        await this.redisClient.publish(channel, message).catch((error) => {
            this.logger.error(`Failed to publish message to ${channel}: ${error.message}`);
        });

        this.logger.log(`Message published to ${channel}: ${message}`);
    }

    // Subscribe to Redis channel
    async subscribe(channel: string, callback: (message: string) => void) {
        // Validate channel
        if (!channel) {
            this.logger.error('Invalid channel provided.');
            return; // Exit early if channel is invalid
        }

        // We don't expect 'subscribe' to fail unless Redis is disconnected.
        await this.redisClient.subscribe(channel).catch((error) => {
            this.logger.error(`Failed to subscribe to ${channel}: ${error.message}`);
        });

        // Listen for incoming messages
        this.redisClient.on('message', (channel, message) => {
            if (channel === channel) {
                callback(message);
            }
        });

        this.logger.log(`Subscribed to channel: ${channel}`);
    }
}
