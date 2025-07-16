import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const taskData = {
      ...createTaskDto,
      user: new Types.ObjectId(userId),
      dueDate: createTaskDto.dueDate
        ? new Date(createTaskDto.dueDate)
        : undefined,
    };
    const newTask = new this.taskModel(taskData);
    return newTask.save();
  }

  async findAll(
    userId: string,
    filters?: {
      status?: string;
      title?: string;
      from?: string;
      to?: string;
    },
  ): Promise<Task[]> {
    const query: Record<string, any> = { user: new Types.ObjectId(userId) };

    // Filter by status if provided
    if (filters?.status) {
      query.status = filters.status;
    }

    // Search by title if provided
    if (filters?.title) {
      query.title = { $regex: filters.title, $options: 'i' };
    }

    // Filter by date range if provided
    if (filters?.from || filters?.to) {
      const dateQuery: Record<string, Date> = {};
      if (filters.from) {
        dateQuery.$gte = new Date(filters.from);
      }
      if (filters.to) {
        dateQuery.$lte = new Date(filters.to);
      }
      query.dueDate = dateQuery;
    }

    return this.taskModel.find(query).exec();
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.user.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    const updateData = {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate
        ? new Date(updateTaskDto.dueDate)
        : task.dueDate,
    };

    Object.assign(task, updateData);
    return task.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.taskModel.findByIdAndDelete(id).exec();
  }

  async findByStatus(status: TaskStatus, userId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        user: new Types.ObjectId(userId),
        status,
      })
      .exec();
  }

  async searchTasks(query: string, userId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        user: new Types.ObjectId(userId),
        title: { $regex: query, $options: 'i' },
      })
      .exec();
  }

  async findTasksByDateRange(
    startDate: Date,
    endDate: Date,
    userId: string,
  ): Promise<Task[]> {
    return this.taskModel
      .find({
        user: new Types.ObjectId(userId),
        dueDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .exec();
  }

  async getTasksGroupedByStatus(userId: string): Promise<{
    TODO: Task[];
    IN_PROGRESS: Task[];
    DONE: Task[];
  }> {
    const tasks = await this.taskModel
      .find({ user: new Types.ObjectId(userId) })
      .exec();

    return {
      TODO: tasks.filter((task) => task.status === TaskStatus.TODO),
      IN_PROGRESS: tasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS,
      ),
      DONE: tasks.filter((task) => task.status === TaskStatus.DONE),
    };
  }

  async updateStatus(
    id: string,
    status: string,
    userId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Validate status value
    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      throw new NotFoundException('Invalid status value');
    }

    task.status = status as TaskStatus;
    return task.save();
  }
}
