import { Router, type RequestHandler } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { subtaskService } from '../services/subtask.service.js';
import { requireAuth } from '../middleware/auth.js';

const createSubtaskSchema = z.object({
  title: z.string().min(1).max(200),
  completed: z.boolean().optional(),
});

const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
});

const router: Router = Router();

router.use(requireAuth as RequestHandler);

router.get('/task/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = String(req.params.taskId);
    const subtasks = await subtaskService.getSubtasksByTaskId(taskId);

    res.json({
      success: true,
      data: subtasks,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, title } = req.body;
    const input = createSubtaskSchema.parse({ title });

    const subtask = await subtaskService.createSubtask(taskId, input);

    res.status(201).json({
      success: true,
      data: subtask,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const input = updateSubtaskSchema.parse(req.body);

    const subtask = await subtaskService.updateSubtask(id, input);

    if (!subtask) {
      res.status(404).json({
        success: false,
        error: 'Subtask not found',
      });
      return;
    }

    res.json({
      success: true,
      data: subtask,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const subtask = await subtaskService.toggleSubtask(id);

    if (!subtask) {
      res.status(404).json({
        success: false,
        error: 'Subtask not found',
      });
      return;
    }

    res.json({
      success: true,
      data: subtask,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const deleted = await subtaskService.deleteSubtask(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Subtask not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Subtask deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
