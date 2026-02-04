'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api-client';
import { Task, TaskStatus, TaskPriority, TaskFormData } from '@/types';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  workspaceId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export async function getTasks(filters?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}): Promise<Task[]> {
  try {
    const tasks = await apiClient.getTasks({
      status: filters?.status,
      priority: filters?.priority,
      search: filters?.search,
    }) as Task[];
    return tasks;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
}

export async function getTask(id: string): Promise<Task | null> {
  try {
    return await apiClient.getTask(id) as Task;
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return null;
  }
}

export async function createTask(
  data: CreateTaskInput
): Promise<{ success: boolean; error?: string; data?: Task }> {
  try {
    const task = await apiClient.createTask({
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
      workspaceId: data.workspaceId,
    }) as Task;
    revalidatePath('/');
    if (data.workspaceId) {
      revalidatePath(`/projects/${data.workspaceId}`);
    }
    return { success: true, data: task };
  } catch (error) {
    console.error('Failed to create task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

export async function updateTask(
  id: string,
  data: UpdateTaskInput
): Promise<{ success: boolean; error?: string; data?: Task }> {
  try {
    const task = await apiClient.updateTask(id, {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
    }) as Task;
    revalidatePath('/');
    if (task.workspaceId) {
      revalidatePath(`/projects/${task.workspaceId}`);
    }
    return { success: true, data: task };
  } catch (error) {
    console.error('Failed to update task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  workspaceId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.updateTask(taskId, { status });
    revalidatePath('/');
    if (workspaceId) {
      revalidatePath(`/projects/${workspaceId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { success: false, error: 'Failed to update task status' };
  }
}

export async function updateTaskPriority(
  taskId: string,
  priority: TaskPriority,
  workspaceId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.updateTask(taskId, { priority });
    revalidatePath('/');
    if (workspaceId) {
      revalidatePath(`/projects/${workspaceId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to update task priority:', error);
    return { success: false, error: 'Failed to update task priority' };
  }
}

export async function deleteTask(
  taskId: string,
  workspaceId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.deleteTask(taskId);
    revalidatePath('/');
    if (workspaceId) {
      revalidatePath(`/projects/${workspaceId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}
