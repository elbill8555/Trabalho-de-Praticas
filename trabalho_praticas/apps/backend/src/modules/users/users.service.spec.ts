import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'u1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── getMe ───────────────────────────────────────────────────────────────────

  describe('getMe', () => {
    it('should return the user profile when found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.getMe('u1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        select: { id: true, name: true, email: true, createdAt: true },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getMe('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.getMe('nonexistent')).rejects.toThrow('User not found');
    });
  });

  // ─── updateMe ────────────────────────────────────────────────────────────────

  describe('updateMe', () => {
    it('should update and return the user profile', async () => {
      const updatedUser = { id: 'u1', name: 'Jane Doe', email: 'john@example.com' };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser as any);

      const result = await service.updateMe('u1', { name: 'Jane Doe' });

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { name: 'Jane Doe' },
        select: { id: true, name: true, email: true },
      });
    });

    it('should propagate Prisma errors on update failure', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValue(new Error('DB Error'));

      await expect(service.updateMe('u1', { name: 'Jane' })).rejects.toThrow('DB Error');
    });
  });
});
