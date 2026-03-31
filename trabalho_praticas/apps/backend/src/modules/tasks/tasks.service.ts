import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus, Priority } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    filters: { status?: TaskStatus; priority?: Priority },
  ) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
      },
      include: { project: { select: { id: true, name: true, color: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId || null,
        userId,
      },
      include: { project: { select: { id: true, name: true, color: true } } },
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    await this.findOneOrFail(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { project: { select: { id: true, name: true, color: true } } },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOneOrFail(userId, id);
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted' };
  }

  private async findOneOrFail(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }
}
