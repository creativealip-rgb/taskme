import { Router, type RequestHandler } from 'express';
import { tasksController } from '../controllers/tasks.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router: Router = Router();

router.use(requireAuth);

router.get('/', tasksController.getTasks.bind(tasksController));
router.post('/', tasksController.createTask.bind(tasksController));
router.get('/:id', tasksController.getTaskById.bind(tasksController));
router.patch('/:id', tasksController.updateTask.bind(tasksController));
router.delete('/:id', tasksController.deleteTask.bind(tasksController));

export default router;
