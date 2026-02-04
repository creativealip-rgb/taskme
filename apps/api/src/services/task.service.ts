import { mockDbData } from '../config/database.js';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface TaskFilters {
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
}

export class TaskService {
  async createTask(userId: string, input: CreateTaskInput): Promise<any> {
    const newTask = {
      id: `task-${Date.now()}`,
      userId,
      workspaceId: input.workspaceId || null,
      title: input.title,
      description: input.description || null,
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      dueDate: input.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDbData.tasks.push(newTask);
    return newTask;
  }

  async getTasks(userId: string, filters: TaskFilters = {}): Promise<any[]> {
    let result = [...mockDbData.tasks];

    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }

    if (filters.priority) {
      result = result.filter(t => t.priority === filters.priority);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search))
      );
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result.map(task => ({
      ...task,
      subtasks: mockDbData.subtasks.filter(st => st.taskId === task.id),
    }));
  }

  async getTaskById(userId: string, taskId: string): Promise<any | null> {
    const task = mockDbData.tasks.find(t => t.id === taskId);
    if (!task) return null;

    return {
      ...task,
      subtasks: mockDbData.subtasks.filter(st => st.taskId === taskId),
    };
  }

  async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<any | null> {
    const index = mockDbData.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const updated = {
      ...mockDbData.tasks[index],
      ...input,
      dueDate: input.dueDate || null,
      updatedAt: new Date().toISOString(),
    };

    mockDbData.tasks[index] = updated;
    return updated;
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const index = mockDbData.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return false;

    mockDbData.tasks.splice(index, 1);
    return true;
  }
}

export const taskService = new TaskService();
