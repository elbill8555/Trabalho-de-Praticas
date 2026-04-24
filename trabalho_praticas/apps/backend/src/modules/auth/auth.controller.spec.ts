import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockService = {
    register: jest.fn(),
    login: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user', async () => {
    const dto = { email: 'a@a.com', password: '123', name: 'A' };
    mockService.register.mockResolvedValue({ id: 'u1' });
    const result = await controller.register(dto);
    expect(result).toEqual({ id: 'u1' });
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('should login a user', async () => {
    const dto = { email: 'a@a.com', password: '123' };
    mockService.login.mockResolvedValue({ access_token: 'tk' });
    const result = await controller.login(dto);
    expect(result).toEqual({ access_token: 'tk' });
    expect(service.login).toHaveBeenCalledWith(dto);
  });
});
