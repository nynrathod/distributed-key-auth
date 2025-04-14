import { Test, TestingModule } from '@nestjs/testing';
import { AuthKeyService } from './auth-key.service';

describe('AuthKeyService', () => {
  let service: AuthKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthKeyService],
    }).compile();

    service = module.get<AuthKeyService>(AuthKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
