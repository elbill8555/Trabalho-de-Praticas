import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Request() req) {
    try {
      console.log('[PROJECTS CONTROLLER] findAll called. User ID:', req.user?.id);
      const result = await this.projectsService.findAll(req.user.id);
      console.log('[PROJECTS CONTROLLER] findAll success. Projects count:', result?.length || 0);
      return result;
    } catch (error) {
      console.error('[PROJECTS CONTROLLER] findAll error:', error);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.projectsService.findOne(req.user.id, id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.projectsService.remove(req.user.id, id);
  }
}
