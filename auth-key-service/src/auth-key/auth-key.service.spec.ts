import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthKeyService } from './auth-key.service';
import { RedisService } from '../common/redis/redis.service';
import { AuthKey } from './entities/auth-key.entity';

describe('AuthKeyService - Minimal Test', () => {
  let service: AuthKeyService;

  // Mock repository to return expected data
  const mockRepository = {
    save: jest.fn().mockImplementation((key) =>
      Promise.resolve({
        ...key,
      }),
    ),
  };

  // Minimal RedisService mock
  const mockRedisService = {
    getCache: jest.fn(),
    setCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthKeyService,
        {
          provide: getRepositoryToken(AuthKey),
          useValue: mockRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<AuthKeyService>(AuthKeyService);
  });

  it('should successfully generate an auth key', async () => {
    const result = await service.generateKey('test-user', 100, 3600);
    expect(result).toBeDefined();
    expect(result.userId).toBe('test-user');
    expect(result.rateLimit).toBe(100);
    expect(result.expiration).toBe(3600);
  });
});
