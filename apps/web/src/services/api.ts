import { Task, TaskFilters, ApiResponse } from '../types/task';
import { ApiValidationError } from '../components/TaskModal';

// Add type declaration for import.meta.env
declare global {
  interface ImportMetaEnv {
    VITE_API_URL?: string;
  }

  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }

  isValidationError(): boolean {
    return this.status === 400 && 
           this.data !== null && 
           typeof this.data === 'object' && 
           'details' in (this.data as Record<string, unknown>);
  }

  getValidationErrors(): ApiValidationError[] {
    if (!this.isValidationError()) return [];
    const data = this.data as { details: Array<{ path: string; message: string }> };
    return data.details.map((error) => ({
      path: error.path,
      message: error.message,
    }));
  }
}

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchWithAuth<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.error || 'An error occurred',
      response.status,
      data
    );
  }

  return data;
}

export const tasksApi = {
  async getAll(filters: Partial<TaskFilters> & { search?: string; sortBy?: string; sortOrder?: string } = {}): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const query = params.toString();
    return fetchWithAuth(`/api/tasks${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<ApiResponse<Task>> {
    return fetchWithAuth(`/api/tasks/${id}`);
  },

  async create(task: Omit<Task, 'id'>): Promise<ApiResponse<Task>> {
    return fetchWithAuth('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async update(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    return fetchWithAuth(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return fetchWithAuth(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
