import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { taskService } from '../services/task.service.js';
import { AuthSession } from '../config/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthSession['user'];
    }
  }
}

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

const taskFiltersSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export class TasksController {
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const filters = taskFiltersSchema.parse(req.query);

      const tasks = await taskService.getTasks(userId, filters);

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);

      const task = await taskService.getTaskById(userId, id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const input = createTaskSchema.parse(req.body);

      const task = await taskService.createTask(userId, {
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      });

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);
      const input = updateTaskSchema.parse(req.body);

      const task = await taskService.updateTask(userId, id, {
        ...input,
        dueDate: input.dueDate === null ? null : input.dueDate ? new Date(input.dueDate) : undefined,
      });

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);

      const deleted = await taskService.deleteTask(userId, id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tasksController = new TasksController();
