import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthKey } from './entities/auth-key.entity';
import { randomBytes } from 'crypto';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class AuthKeyService {
  constructor(
    @InjectRepository(AuthKey)
    private authKeyRepository: Repository<AuthKey>,
    @Inject(forwardRef(() => RedisService))
    private redisService: RedisService,
  ) {}

  // Generate a new Auth Key
  async generateKey(
    userId: string,
    rateLimit: number,
    expiration: number,
  ): Promise<AuthKey> {
    const newKey = new AuthKey();

    newKey.accessKey = this.generateRandomKey();
    newKey.userId = userId;
    newKey.rateLimit = rateLimit;
    newKey.expiration = expiration;

    await this.authKeyRepository.save(newKey);
    return newKey;
  }

  // Delete an Auth Key
  async deleteKey(accessKey: string): Promise<void> {
    const keyToDelete = await this.authKeyRepository.findOne({
      where: { accessKey },
    });

    if (!keyToDelete) {
      throw new NotFoundException('Auth key not found');
    }

    await this.authKeyRepository.remove(keyToDelete);
  }

  // Update an Auth Key's rate limit or expiration
  async updateKey(
    accessKey: string,
    newRateLimit?: number,
    newExpiration?: number,
  ): Promise<AuthKey> {
    if (typeof newRateLimit !== 'number' && typeof newExpiration !== 'number') {
      throw new BadRequestException(
        'At least one field (rateLimit or expiration) must be provided.',
      );
    }

    const keyToUpdate = await this.authKeyRepository.findOne({
      where: { accessKey },
    });
    if (!keyToUpdate) {
      throw new NotFoundException('Auth key not found');
    }

    if (typeof newRateLimit === 'number') {
      const cacheKey = `rate_limit:${accessKey}`;
      const cachedRateLimit = await this.redisService.getCache(cacheKey);
      if (cachedRateLimit) {
        await this.redisService.setCache(cacheKey, newRateLimit.toString());
        console.log(`Updated rate limit in cache for ${accessKey}`);
      }
      keyToUpdate.rateLimit = newRateLimit;
    }

    if (typeof newExpiration === 'number') {
      keyToUpdate.expiration = newExpiration;
    }

    await this.authKeyRepository.save(keyToUpdate);
    return keyToUpdate;
  }

  async getUserDetails(accessKey: string): Promise<AuthKey> {
    const result = await this.authKeyRepository.findOne({
      where: { accessKey },
    });

    if (!result) throw new NotFoundException('Auth key not found');

    result.expiration = Number(result.expiration);

    return result;
  }

  // Disable a key without deleting it
  async disableKey(accessKey: string): Promise<AuthKey> {
    const keyToDisable = await this.authKeyRepository.findOne({
      where: { accessKey },
    });

    if (!keyToDisable) {
      throw new NotFoundException('Auth key not found');
    }

    if (!keyToDisable.isActive) {
      throw new BadRequestException('Auth key is already disabled');
    }

    keyToDisable.isActive = false;
    await this.authKeyRepository.save(keyToDisable);
    return keyToDisable;
  }

  // Helper function to generate random keys
  private generateRandomKey(): string {
    // 64-character hex string
    return randomBytes(32).toString('hex');
  }
}
