import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class ProjectMembersService {
  private readonly logger = new Logger(ProjectMembersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async addMember(requesterId: string, dto: AddMemberDto) {
    // 1. Verificar se o projeto existe e se o solicitante tem permissão (OWNER ou ADMIN)
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { members: { where: { userId: requesterId } } },
    });

    if (!project) throw new NotFoundException('Project not found');

    const requesterMember = project.members[0];
    const isOwnerByField = project.userId === requesterId;
    
    if (!isOwnerByField && (!requesterMember || (requesterMember.role !== ProjectRole.OWNER && requesterMember.role !== ProjectRole.ADMIN))) {
      throw new ForbiddenException('Only owners and admins can add members');
    }

    // 2. Encontrar o usuário pelo email
    const userToAdd = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!userToAdd) throw new NotFoundException('User with this email not found');

    // 3. Verificar se já é membro
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: userToAdd.id,
          projectId: dto.projectId,
        },
      },
    });

    if (existingMember) throw new ConflictException('User is already a member of this project');

    // 4. Adicionar membro
    const newMember = await this.prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId: dto.projectId,
        role: dto.role,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { name: true } },
      },
    });

    // 5. Enviar email de notificação
    try {
      await this.sendMemberAddedEmail(
        userToAdd.email,
        userToAdd.name,
        newMember.project.name,
      );
      this.logger.log(`Email sent to ${userToAdd.email} for project membership`);
    } catch (error) {
      this.logger.warn(`Failed to send email notification: ${(error as any).message}`);
      // Não falhar a operação se o email não for enviado
    }

    return newMember;
  }

  async listMembers(projectId: string, userId: string) {
    // Verificar se o usuário faz parte do projeto
    const membership = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });

    const isDirectOwner = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!membership && !isDirectOwner) {
      throw new ForbiddenException('You do not have access to this project members list');
    }

    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateMemberRole(requesterId: string, projectId: string, targetUserId: string, dto: UpdateMemberRoleDto) {
    await this.validateAdminPrivileges(requesterId, projectId);

    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: targetUserId, projectId } },
    });

    if (!member) throw new NotFoundException('Member not found');
    if (member.userId === requesterId) throw new ForbiddenException('You cannot change your own role');

    return this.prisma.projectMember.update({
      where: { id: member.id },
      data: { role: dto.role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async removeMember(requesterId: string, projectId: string, targetUserId: string) {
    await this.validateAdminPrivileges(requesterId, projectId);

    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: targetUserId, projectId } },
    });

    if (!member) throw new NotFoundException('Member not found');
    
    // Não permitir remover o OWNER do campo principal do projeto via este endpoint (por enquanto)
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (project.userId === targetUserId) {
      throw new ForbiddenException('The primary project owner cannot be removed as a member');
    }

    await this.prisma.projectMember.delete({
      where: { id: member.id },
    });

    return { message: 'Member removed successfully' };
  }

  private async validateAdminPrivileges(requesterId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { userId: requesterId } } },
    });

    if (!project) throw new NotFoundException('Project not found');

    const requesterMember = project.members[0];
    const isOwnerByField = project.userId === requesterId;

    if (!isOwnerByField && (!requesterMember || (requesterMember.role !== ProjectRole.OWNER && requesterMember.role !== ProjectRole.ADMIN))) {
      throw new ForbiddenException('Administrative privileges required');
    }
  }

  private async sendMemberAddedEmail(email: string, name: string, projectName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #003f87; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Adicionado ao Projeto!</h1>
        </div>
        <div style="padding: 20px; color: #333; line-height: 1.6;">
          <p>Olá <strong>${name}</strong>,</p>
          <p>Você foi adicionado como membro do projeto <strong>${projectName}</strong>.</p>
          <p>Agora você pode colaborar, visualizar tarefas e trabalhar em conjunto com a equipe.</p>
          <p style="margin-top: 20px;">Acesse o painel para começar a trabalhar no projeto.</p>
          <br/>
          <p>Abraços,<br/>Equipe Fluid</p>
        </div>
      </div>
    `;

    await this.mailService.sendCustomEmail(
      email,
      `Você foi adicionado ao projeto ${projectName}`,
      html,
    );
  }
}
