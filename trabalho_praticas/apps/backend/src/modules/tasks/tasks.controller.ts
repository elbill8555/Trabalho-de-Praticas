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
      const msg1 = `[TASKS CONTROLLER] findAll called. User: ${JSON.stringify(req.user)}`;
      console.log(msg1);
      console.error(msg1); // Also log to error stream
      
      if (!req.user?.id) {
        const errMsg = 'req.user or req.user.id is undefined';
        console.error('[TASKS CONTROLLER ERROR]', errMsg);
        throw new Error(errMsg);
      }
      
      const result = await this.tasksService.findAll(req.user.id, { status, priority });
      console.log(`[TASKS CONTROLLER] success: ${result?.length || 0} tasks`);
      return result;
    } catch (error) {
      const errorMsg = `[TASKS CONTROLLER] error: ${(error as any)?.message} | ${String(error)}`;
      console.error(errorMsg);
      console.error((error as any)?.stack);
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
