import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by task status (TODO, IN_PROGRESS, DONE)',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Search by task title',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Filter tasks from this date (ISO format)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'Filter tasks to this date (ISO format)',
  })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('title') title?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.tasksService.findAll(req.user.id, { status, title, from, to });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task found' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Get('grouped/status')
  @ApiOperation({
    summary: 'Get tasks grouped by status (To Do, In Progress, Done)',
  })
  @ApiResponse({ status: 200, description: 'Tasks grouped by status' })
  getTasksGroupedByStatus(@Req() req: AuthenticatedRequest) {
    return this.tasksService.getTasksGroupedByStatus(req.user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Toggle task status' })
  @ApiParam({ name: 'id', required: true, description: 'Task ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['TODO', 'IN_PROGRESS', 'DONE'],
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Task status updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.updateStatus(id, status, req.user.id);
  }
}
