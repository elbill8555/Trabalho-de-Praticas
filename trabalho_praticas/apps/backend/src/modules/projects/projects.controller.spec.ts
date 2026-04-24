import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all projects for user', async () => {
      mockService.findAll.mockResolvedValue([]);
      const result = await controller.findAll({ user: { id: 'u1' } });
      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith('u1');
    });
  });

  describe('create', () => {
    it('should create a project', async () => {
      const dto = { name: 'P1', description: 'desc' };
      mockService.create.mockResolvedValue({ id: 'p1', ...dto });
      const result = await controller.create({ user: { id: 'u1' } }, dto);
      expect(result.name).toBe('P1');
      expect(service.create).toHaveBeenCalledWith('u1', dto);
    });
  });
});
