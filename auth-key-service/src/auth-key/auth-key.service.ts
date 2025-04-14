import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthKey } from './entities/auth-key.entity';
import { RedisService } from '../common/redis/redis.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthKeyService {
    constructor(
        @InjectRepository(AuthKey)
        private authKeyRepository: Repository<AuthKey>,
        private redisService: RedisService, // Redis service to interact with channels
    ) {}

    // Generate a new Auth Key
    async generateKey(userId: string, rateLimit: number, expiration: Date): Promise<AuthKey> {
        const newKey = new AuthKey();
        newKey.key = this.generateRandomKey(); // Key generation logic
        newKey.userId = userId;
        newKey.rateLimit = rateLimit;
        newKey.expiration = expiration;

        await this.authKeyRepository.save(newKey);

        // Publish an event to Redis when the new key is generated
        await this.redisService.publish('auth-key-generated', JSON.stringify(newKey));

        return newKey;
    }

    // Delete an Auth Key
    async deleteKey(key: string): Promise<AuthKey> {
        const keyToDelete = await this.authKeyRepository.findOne({ where: { key } });
        if (!keyToDelete) {
            throw new NotFoundException('Auth key not found');
        }

        await this.authKeyRepository.remove(keyToDelete);

        // Publish an event to Redis when the key is deleted
        await this.redisService.publish('auth-key-deleted', JSON.stringify(keyToDelete));

        return keyToDelete;
    }

    // Update an Auth Key's rate limit or expiration
    async updateKey(key: string, newRateLimit: number, newExpiration: Date): Promise<AuthKey> {
        const keyToUpdate = await this.authKeyRepository.findOne({ where: { key } });
        if (!keyToUpdate) {
            throw new NotFoundException('Auth key not found');
        }

        keyToUpdate.rateLimit = newRateLimit;
        keyToUpdate.expiration = newExpiration;

        await this.authKeyRepository.save(keyToUpdate);

        // Publish an event to Redis when the key is updated
        await this.redisService.publish('auth-key-updated', JSON.stringify(keyToUpdate));

        return keyToUpdate;
    }

    // Get details for a specific Auth Key
    async getUserDetails(key: string): Promise<AuthKey> {
        const userKey = await this.authKeyRepository.findOne({ where: { key } });
        if (!userKey) {
            throw new NotFoundException('Invalid key');
        }

        // Check if the key has expired
        if (new Date() > userKey.expiration) {
            throw new ForbiddenException('Auth key has expired');
        }

        return userKey;
    }

    // Helper function to generate random keys
    private generateRandomKey(): string {
        return randomBytes(32).toString('hex'); // 64-character hex string
    }
}
