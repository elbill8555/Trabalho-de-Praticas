import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        tasks: {
          include: { project: { select: { id: true, name: true, color: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color ?? '#003f87',
        userId,
      },
    });

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && user.email) {
        this.mailService.sendProjectCreatedEmail(
          user.email,
          user.name || 'Usuário',
          project.name,
        );
      }
    } catch (error) {
      console.error('Error sending project creation email', error);
    }

    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.findOneOrFail(userId, id);
    return this.prisma.project.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOneOrFail(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted' };
  }

  private async findOneOrFail(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({ where: { id, userId } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
