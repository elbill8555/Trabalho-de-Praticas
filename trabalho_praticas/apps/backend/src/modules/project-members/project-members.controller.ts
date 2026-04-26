import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(private readonly service: ProjectMembersService) {}

  @Post()
  async addMember(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto: Omit<AddMemberDto, 'projectId'>,
  ) {
    return this.service.addMember(req.user.id, { ...dto, projectId });
  }

  @Get()
  async listMembers(
    @Request() req,
    @Param('projectId') projectId: string,
  ) {
    return this.service.listMembers(projectId, req.user.id);
  }

  @Patch(':userId')
  async updateRole(
    @Request() req,
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.service.updateMemberRole(req.user.id, projectId, userId, dto);
  }

  @Delete(':userId')
  async removeMember(
    @Request() req,
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.removeMember(req.user.id, projectId, userId);
  }
}
