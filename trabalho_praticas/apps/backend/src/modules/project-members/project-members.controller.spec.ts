import { Test, TestingModule } from '@nestjs/testing';
import { ProjectMembersController } from './project-members.controller';
import { ProjectMembersService } from './project-members.service';
import { ProjectRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('ProjectMembersController', () => {
  let controller: ProjectMembersController;
  let service: ProjectMembersService;

  const mockService = {
    addMember: jest.fn(),
    listMembers: jest.fn(),
    updateMemberRole: jest.fn(),
    removeMember: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectMembersController],
      providers: [
        { provide: ProjectMembersService, useValue: mockService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ProjectMembersController>(ProjectMembersController);
    service = module.get<ProjectMembersService>(ProjectMembersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addMember', () => {
    it('should call service.addMember', async () => {
      const dto = { email: 'test@test.com', role: ProjectRole.MEMBER };
      const user = { id: 'u1' };
      mockService.addMember.mockResolvedValue({ id: 'm1' });

      const result = await controller.addMember({ user }, 'p1', dto);

      expect(service.addMember).toHaveBeenCalledWith('u1', { ...dto, projectId: 'p1' });
      expect(result).toEqual({ id: 'm1' });
    });
  });

  describe('listMembers', () => {
    it('should call service.listMembers', async () => {
      mockService.listMembers.mockResolvedValue([]);
      const result = await controller.listMembers({ user: { id: 'u1' } }, 'p1');

      expect(service.listMembers).toHaveBeenCalledWith('p1', 'u1');
      expect(result).toEqual([]);
    });
  });

  describe('updateRole', () => {
    it('should call service.updateMemberRole', async () => {
      const dto = { role: ProjectRole.ADMIN };
      mockService.updateMemberRole.mockResolvedValue({ id: 'm1' });

      const result = await controller.updateRole({ user: { id: 'u1' } }, 'p1', 'u2', dto);

      expect(service.updateMemberRole).toHaveBeenCalledWith('u1', 'p1', 'u2', dto);
      expect(result).toEqual({ id: 'm1' });
    });
  });

  describe('removeMember', () => {
    it('should call service.removeMember', async () => {
      mockService.removeMember.mockResolvedValue({ message: 'ok' });

      const result = await controller.removeMember({ user: { id: 'u1' } }, 'p1', 'u2');

      expect(service.removeMember).toHaveBeenCalledWith('u1', 'p1', 'u2');
      expect(result).toEqual({ message: 'ok' });
    });
  });
});
