import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from '../../database/prisma.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [TasksController],
  providers: [TasksService, PrismaService],
  exports: [TasksService, PrismaService],
})
export class TasksModule {}
