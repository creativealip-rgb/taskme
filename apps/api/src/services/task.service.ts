import { eq, and, desc, asc, like, or } from 'drizzle-orm';
import { db, tasks, type Task, type NewTask } from '../db/index.js';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date | null;
}

export interface TaskFilters {
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export class TaskService {
  async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    const now = new Date();
    const newTask: NewTask = {
      id: crypto.randomUUID(),
      userId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      dueDate: input.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(tasks).values(newTask);
    return newTask as Task;
  }

  async getTasks(userId: string, filters: TaskFilters = {}): Promise<Task[]> {
    const conditions = [eq(tasks.userId, userId)];

    if (filters.status) {
      conditions.push(eq(tasks.status, filters.status));
    }

    if (filters.priority) {
      conditions.push(eq(tasks.priority, filters.priority));
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(tasks.title, searchTerm),
          like(tasks.description ?? '', searchTerm)
        )!
      );
    }

    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';

    const orderBy =
      sortOrder === 'asc'
        ? asc(tasks[sortBy])
        : desc(tasks[sortBy]);

    const result = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(orderBy);

    return result;
  }

  async getTaskById(userId: string, taskId: string): Promise<Task | null> {
    const result = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    return result[0] ?? null;
  }

  async updateTask(
    userId: string,
    taskId: string,
    input: UpdateTaskInput
  ): Promise<Task | null> {
    const existingTask = await this.getTaskById(userId, taskId);
    if (!existingTask) {
      return null;
    }

    const updates: Partial<NewTask> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description ?? null;
    if (input.status !== undefined) updates.status = input.status;
    if (input.priority !== undefined) updates.priority = input.priority;
    if (input.dueDate !== undefined) updates.dueDate = input.dueDate ?? null;

    await db
      .update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    return this.getTaskById(userId, taskId);
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const existingTask = await this.getTaskById(userId, taskId);
    if (!existingTask) {
      return false;
    }

    await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    return true;
  }
}

export const taskService = new TaskService();
