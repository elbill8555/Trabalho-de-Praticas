import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockService = {
    getMe: jest.fn(),
    updateMe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user profile', async () => {
    const user = { id: 'u1', name: 'User' };
    mockService.getMe.mockResolvedValue(user);
    const result = await controller.getMe({ user: { id: 'u1' } });
    expect(result).toEqual(user);
    expect(service.getMe).toHaveBeenCalledWith('u1');
  });
});
