import { mockDbData } from '../config/database.js';

export interface CreateSubtaskInput {
  title: string;
  completed?: boolean;
}

export class SubtaskService {
  async createSubtask(taskId: string, input: CreateSubtaskInput): Promise<any> {
    const subtask = {
      id: `subtask-${Date.now()}`,
      taskId,
      title: input.title,
      completed: input.completed || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDbData.subtasks.push(subtask);
    return subtask;
  }

  async getSubtasksByTaskId(taskId: string): Promise<any[]> {
    return mockDbData.subtasks
      .filter(s => s.taskId === taskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getSubtaskById(subtaskId: string): Promise<any | null> {
    return mockDbData.subtasks.find(s => s.id === subtaskId) || null;
  }

  async updateSubtask(subtaskId: string, input: Partial<CreateSubtaskInput>): Promise<any | null> {
    const index = mockDbData.subtasks.findIndex(s => s.id === subtaskId);
    if (index === -1) return null;

    const updated = {
      ...mockDbData.subtasks[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    mockDbData.subtasks[index] = updated;
    return updated;
  }

  async toggleSubtask(subtaskId: string): Promise<any | null> {
    const subtask = mockDbData.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return null;

    subtask.completed = !subtask.completed;
    subtask.updatedAt = new Date().toISOString();
    return subtask;
  }

  async deleteSubtask(subtaskId: string): Promise<boolean> {
    const index = mockDbData.subtasks.findIndex(s => s.id === subtaskId);
    if (index === -1) return false;

    mockDbData.subtasks.splice(index, 1);
    return true;
  }

  async deleteSubtasksByTaskId(taskId: string): Promise<void> {
    mockDbData.subtasks = mockDbData.subtasks.filter(s => s.taskId !== taskId);
  }
}

export const subtaskService = new SubtaskService();
