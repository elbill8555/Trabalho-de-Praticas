import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;
  let mail: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findMany: jest.fn(),
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
            sendProjectCreatedEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
    mail = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return projects for a user', async () => {
      const result = [{ id: '1', name: 'Proj 1' }];
      jest.spyOn(prisma.project, 'findMany').mockResolvedValue(result as any);

      expect(await service.findAll('u1')).toEqual(result);
      expect(prisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'u1' },
      }));
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if project not found', async () => {
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);
      await expect(service.findOne('u1', 'p1')).rejects.toThrow(NotFoundException);
    });

    it('should return the project when found', async () => {
      const proj = { id: 'p1', name: 'My Project', tasks: [] };
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(proj as any);

      const result = await service.findOne('u1', 'p1');
      expect(result).toEqual(proj);
    });
  });

  describe('create', () => {
    it('should create project and send email', async () => {
      const projResult = { id: 'p1', name: 'New Proj' };
      jest.spyOn(prisma.project, 'create').mockResolvedValue(projResult as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ email: 't@t.com', name: 'Bob' } as any);

      const dto = { name: 'New Proj' };
      const result = await service.create('u1', dto);

      expect(prisma.project.create).toHaveBeenCalled();
      expect(mail.sendProjectCreatedEmail).toHaveBeenCalledWith('t@t.com', 'New Proj');
      expect(result).toEqual(projResult);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if project does not belong to user', async () => {
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);
      await expect(service.update('u1', 'p1', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should update and return the project on success', async () => {
      const existing = { id: 'p1', name: 'Old', userId: 'u1' };
      const updated = { id: 'p1', name: 'Updated', userId: 'u1' };
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.project, 'update').mockResolvedValue(updated as any);

      const result = await service.update('u1', 'p1', { name: 'Updated' });

      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'p1' } }),
      );
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if project not found', async () => {
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);
      await expect(service.remove('u1', 'p1')).rejects.toThrow(NotFoundException);
    });

    it('should delete project if found', async () => {
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue({ id: 'p1' } as any);
      jest.spyOn(prisma.project, 'delete').mockResolvedValue({} as any);

      const result = await service.remove('u1', 'p1');
      expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(result.message).toBe('Project deleted');
    });
  });
});
