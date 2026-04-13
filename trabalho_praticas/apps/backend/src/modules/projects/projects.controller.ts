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
      const msg1 = `[PROJECTS CONTROLLER] findAll called. User: ${JSON.stringify(req.user)}`;
      console.log(msg1);
      console.error(msg1); // Also log to error stream
      
      if (!req.user?.id) {
        const errMsg = 'req.user or req.user.id is undefined';
        console.error('[PROJECTS CONTROLLER ERROR]', errMsg);
        throw new Error(errMsg);
      }
      
      const result = await this.projectsService.findAll(req.user.id);
      console.log(`[PROJECTS CONTROLLER] success: ${result?.length || 0} projects`);
      return result;
    } catch (error) {
      const errorMsg = `[PROJECTS CONTROLLER] error: ${(error as any)?.message} | ${String(error)}`;
      console.error(errorMsg);
      console.error((error as any)?.stack);
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
