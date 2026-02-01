import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../types/task';

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
  dueDate: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]).default(TaskStatus.TODO),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]).default(TaskPriority.MEDIUM),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]).optional(),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]).optional(),
  dueDate: z.string().optional(),
});

export const taskFiltersSchema = z.object({
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]).optional(),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
});

export type TaskSchema = z.infer<typeof taskSchema>;
export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
export type TaskFiltersSchema = z.infer<typeof taskFiltersSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  return errors;
}
