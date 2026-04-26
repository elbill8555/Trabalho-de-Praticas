import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus, Priority } from '@prisma/client';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;
  let mail: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
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
            sendTaskCreatedEmail: jest.fn(),
            sendTaskDeletedEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    mail = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = [{ id: '1', title: 'Task 1' }];
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue(result as any);

      expect(await service.findAll('userId', {})).toEqual(result);
      expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          OR: [{ userId: 'userId' }, { assignedToId: 'userId' }],
        },
      }));
    });
  });

  describe('create', () => {
    it('should create a task and send email', async () => {
      const taskResult = { id: '1', title: 'New task', project: { name: 'Proj' } };
      jest.spyOn(prisma.task, 'create').mockResolvedValue(taskResult as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ email: 't@t.com', name: 'Bob' } as any);

      const dto = { title: 'New task', status: TaskStatus.PENDING, priority: Priority.MEDIUM };
      const result = await service.create('u1', dto);

      expect(prisma.task.create).toHaveBeenCalled();
      expect(mail.sendTaskCreatedEmail).toHaveBeenCalledWith('t@t.com', 'New task', 'Proj');
      expect(result).toEqual(taskResult);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(null);
      await expect(service.remove('u1', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should delete task and send email', async () => {
      jest.spyOn(prisma.task, 'findFirst').mockResolvedValue({ id: 't1', title: 'Task' } as any);
      jest.spyOn(prisma.task, 'delete').mockResolvedValue({} as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ email: 't@t.com', name: 'Bob' } as any);

      const result = await service.remove('u1', 't1');

      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
      expect(mail.sendTaskDeletedEmail).toHaveBeenCalledWith('t@t.com', 'Task');
      expect(result.message).toBe('Task deleted');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if task does not belong to user', async () => {
      jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(null);
      await expect(service.update('u1', 't1', { title: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should update and return the task on success', async () => {
      const existing = { id: 't1', title: 'Old', userId: 'u1' };
      const updated = { id: 't1', title: 'Updated', userId: 'u1', project: null };
      jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.task, 'update').mockResolvedValue(updated as any);

      const result = await service.update('u1', 't1', { title: 'Updated' });

      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 't1' } }),
      );
      expect(result).toEqual(updated);
    });
  });

  describe('findAll (with filters)', () => {
    it('should pass status filter to the query', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([]);

      await service.findAll('u1', { status: 'PENDING' as any });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });
  });
});
