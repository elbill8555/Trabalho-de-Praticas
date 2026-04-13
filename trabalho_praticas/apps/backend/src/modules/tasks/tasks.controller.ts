import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TaskStatus, Priority } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: Priority,
  ) {
    try {
      console.log('[TASKS CONTROLLER] findAll called. User ID:', req.user?.id);
      const result = await this.tasksService.findAll(req.user.id, { status, priority });
      console.log('[TASKS CONTROLLER] findAll success. Tasks count:', result?.length || 0);
      return result;
    } catch (error) {
      console.error('[TASKS CONTROLLER] findAll error:', error);
      throw error;
    }
  }

  @Post()
  create(@Request() req, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tasksService.remove(req.user.id, id);
  }
}
