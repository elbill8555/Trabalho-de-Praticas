import { Test, TestingModule } from '@nestjs/testing';
import { ProjectMembersService } from './project-members.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';

describe('ProjectMembersService', () => {
  let service: ProjectMembersService;
  let prisma: PrismaService;

  const mockPrisma = {
    project: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    projectMember: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectMembersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProjectMembersService>(ProjectMembersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addMember', () => {
    const addMemberDto = {
      email: 'test@example.com',
      role: ProjectRole.MEMBER,
      projectId: 'project-1',
    };

    it('should add a member successfully if requester is owner', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({ id: 'project-1', userId: 'owner-id', members: [] });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'test@example.com' });
      mockPrisma.projectMember.findUnique.mockResolvedValue(null);
      mockPrisma.projectMember.create.mockResolvedValue({ id: 'mem-1', userId: 'user-2', projectId: 'project-1' });

      const result = await service.addMember('owner-id', addMemberDto);

      expect(result).toBeDefined();
      expect(mockPrisma.projectMember.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if requester is not owner/admin', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({ 
        id: 'project-1', 
        userId: 'owner-id', 
        members: [{ userId: 'requester-id', role: ProjectRole.MEMBER }] 
      });

      await expect(service.addMember('requester-id', addMemberDto))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if user is already a member', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({ id: 'project-1', userId: 'owner-id', members: [] });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'test@example.com' });
      mockPrisma.projectMember.findUnique.mockResolvedValue({ id: 'existing-mem' });

      await expect(service.addMember('owner-id', addMemberDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('listMembers', () => {
    it('should list members if user is in project', async () => {
      mockPrisma.projectMember.findFirst.mockResolvedValue({ id: 'mem-requester' });
      mockPrisma.project.findFirst.mockResolvedValue(null);
      mockPrisma.projectMember.findMany.mockResolvedValue([{ id: 'mem-1' }, { id: 'mem-2' }]);

      const result = await service.listMembers('project-1', 'requester-id');

      expect(result).toHaveLength(2);
      expect(mockPrisma.projectMember.findMany).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not in project', async () => {
      mockPrisma.projectMember.findFirst.mockResolvedValue(null);
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.listMembers('project-1', 'intruder-id'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateMemberRole', () => {
    it('should update role successfully', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({ id: 'project-1', userId: 'owner-id', members: [] });
      mockPrisma.projectMember.findUnique.mockResolvedValue({ id: 'mem-target', userId: 'target-id' });
      mockPrisma.projectMember.update.mockResolvedValue({ id: 'mem-target', role: ProjectRole.ADMIN });

      const result = await service.updateMemberRole('owner-id', 'project-1', 'target-id', { role: ProjectRole.ADMIN });

      expect(result).toBeDefined();
      expect(mockPrisma.projectMember.update).toHaveBeenCalledWith({
        where: { id: 'mem-target' },
        data: { role: ProjectRole.ADMIN },
      });
    });

    it('should throw ForbiddenException if trying to update own role', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({ id: 'project-1', userId: 'owner-id', members: [] });
      mockPrisma.projectMember.findUnique.mockResolvedValue({ id: 'mem-owner', userId: 'owner-id' });

      await expect(service.updateMemberRole('owner-id', 'project-1', 'owner-id', { role: ProjectRole.ADMIN }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({ id: 'project-1', userId: 'owner-id', members: [] });
      mockPrisma.projectMember.findUnique.mockResolvedValue({ id: 'mem-target', userId: 'target-id' });

      const result = await service.removeMember('owner-id', 'project-1', 'target-id');

      expect(result.message).toContain('removed successfully');
      expect(mockPrisma.projectMember.delete).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when removing the primary owner', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({ id: 'project-1', userId: 'owner-id', members: [] });
      mockPrisma.projectMember.findUnique.mockResolvedValue({ id: 'mem-owner', userId: 'owner-id' });

      await expect(service.removeMember('owner-id', 'project-1', 'owner-id'))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
