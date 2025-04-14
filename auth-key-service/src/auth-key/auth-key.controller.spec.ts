import { Test, TestingModule } from '@nestjs/testing';
import { AuthKeyController } from './auth-key.controller';

describe('AuthKeyController', () => {
  let controller: AuthKeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthKeyController],
    }).compile();

    controller = module.get<AuthKeyController>(AuthKeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
