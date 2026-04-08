import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClerkStrategy } from './clerk.strategy';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ClerkStrategy, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
