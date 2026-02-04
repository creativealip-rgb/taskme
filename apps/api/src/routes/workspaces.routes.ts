import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { workspaceService } from '../services/workspace.service.js';
import { requireAuth } from '../middleware/auth.js';

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

const router: Router = Router();

router.get('/public/:token', async (req, res, next) => {
  try {
    const result = await workspaceService.getPublicWorkspaceTasks(req.params.token);
    if (!result) {
      res.status(404).json({ success: false, error: 'Workspace not found or is not public' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const workspaces = await workspaceService.getWorkspacesByUser(req.user!.id);
    res.json({ success: true, data: workspaces });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const input = createWorkspaceSchema.parse(req.body);
    const workspace = await workspaceService.createWorkspace(req.user!.id, input);
    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(req.params.id);
    if (!workspace) {
      res.status(404).json({ success: false, error: 'Workspace not found' });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const input = updateWorkspaceSchema.parse(req.body);
    const workspace = await workspaceService.updateWorkspace(req.params.id, input);
    if (!workspace) {
      res.status(404).json({ success: false, error: 'Workspace not found' });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/share-token', async (req, res, next) => {
  try {
    const token = await workspaceService.generateNewShareToken(req.params.id);
    res.json({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/toggle-public', async (req, res, next) => {
  try {
    const isPublic = await workspaceService.togglePublic(req.params.id);
    res.json({ success: true, data: { isPublic } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await workspaceService.deleteWorkspace(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Workspace not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
