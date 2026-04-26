import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus, Priority } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findAll(
    userId: string,
    filters: { status?: TaskStatus; priority?: Priority },
  ) {
    return this.prisma.task.findMany({
      where: {
        OR: [{ userId }, { assignedToId: userId }],
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateTaskDto) {
    await this.validateAssigneeForProject(
      dto.projectId || null,
      dto.assignedToId ?? null,
    );

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId || null,
        assignedToId: dto.assignedToId || null,
        userId,
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && user.email) {
        this.mailService.sendTaskCreatedEmail(
          user.email,
          task.title,
          task.project?.name,
        );
      }
    } catch (error) {
      console.error('Error sending task creation email', error);
    }

    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const existingTask = await this.findOneOrFail(userId, id);

    const resolvedProjectId =
      dto.projectId !== undefined ? dto.projectId : existingTask.projectId;
    const resolvedAssignedToId =
      dto.assignedToId !== undefined ? dto.assignedToId : existingTask.assignedToId;

    await this.validateAssigneeForProject(
      resolvedProjectId ?? null,
      resolvedAssignedToId ?? null,
    );

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate:
          dto.dueDate === undefined
            ? undefined
            : dto.dueDate
            ? new Date(dto.dueDate)
            : null,
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(userId: string, id: string) {
    const task = await this.findOneOrFail(userId, id);
    await this.prisma.task.delete({ where: { id } });

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && user.email) {
        this.mailService.sendTaskDeletedEmail(
          user.email,
          task.title,
        );
      }
    } catch (error) {
      console.error('Error sending task deletion email', error);
    }

    return { message: 'Task deleted' };
  }

  private async findOneOrFail(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  private async validateAssigneeForProject(
    projectId: string | null,
    assignedToId: string | null,
  ) {
    if (!assignedToId) return;

    if (!projectId) {
      throw new BadRequestException('A task must belong to a project before assigning a user');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        userId: true,
        members: {
          where: { userId: assignedToId },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canBeAssigned = project.userId === assignedToId || project.members.length > 0;
    if (!canBeAssigned) {
      throw new BadRequestException('Assigned user must be a member of the project');
    }
  }
}
