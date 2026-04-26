import { Module } from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { ProjectMembersController } from './project-members.controller';
import { PrismaService } from '../../database/prisma.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ProjectMembersController],
  providers: [ProjectMembersService, PrismaService],
  exports: [ProjectMembersService],
})
export class ProjectMembersModule {}
