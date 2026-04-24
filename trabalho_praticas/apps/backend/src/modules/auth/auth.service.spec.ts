import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let mail: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    mail = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: '1' } as any);
      
      await expect(
        service.register({ name: 'Test', email: 'test@test.com', password: 'pass' })
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return token if email is new', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock<any>).mockResolvedValue('hashed-pass');
      
      const mockUser = { id: 'u1', name: 'Test', email: 'test@test.com' };
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);

      const result = await service.register({ name: 'Test', email: 'test@test.com', password: 'pass' });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(mail.sendWelcomeEmail).toHaveBeenCalledWith('test@test.com', 'Test');
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      
      await expect(service.login({ email: 'x', password: 'y' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = { id: 'u1', email: 'x', passwordHash: 'hashed' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock<any>).mockResolvedValue(false);

      await expect(service.login({ email: 'x', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('should return token if credentials are valid', async () => {
      const mockUser = { id: 'u1', email: 'x', passwordHash: 'hashed' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock<any>).mockResolvedValue(true);

      const result = await service.login({ email: 'x', password: 'y' });
      expect(result.token).toBe('mock-jwt-token');
    });
  });

  describe('updatePassword', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updatePassword('u1', { oldPassword: 'old', newPassword: 'new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if old password is invalid', async () => {
      const mockUser = { id: 'u1', email: 'x', passwordHash: 'hashed' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock<any>).mockResolvedValue(false);

      await expect(
        service.updatePassword('u1', { oldPassword: 'wrong', newPassword: 'new' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update password successfully when old password is correct', async () => {
      const mockUser = { id: 'u1', email: 'x', passwordHash: 'hashed' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock<any>).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock<any>).mockResolvedValue('new-hashed');
      jest.spyOn(prisma.user, 'update').mockResolvedValue({} as any);

      const result = await service.updatePassword('u1', { oldPassword: 'old', newPassword: 'new' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { passwordHash: 'new-hashed' },
      });
      expect(result.message).toBe('Password updated successfully');
    });
  });
});
