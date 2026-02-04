const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'API request failed');
  }

  const data = await response.json();
  return data.data || data;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export const apiClient = {
  // Tasks
  async getTasks(filters?: { status?: string; priority?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params}` : '';
    return fetchApi(`/api/tasks${query}`);
  },

  async getTask(id: string) {
    return fetchApi(`/api/tasks/${id}`);
  },

  async createTask(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    workspaceId?: string;
  }) {
    return fetchApi('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
  }>) {
    return fetchApi(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id: string) {
    return fetchApi(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Workspaces
  async getWorkspaces() {
    return fetchApi('/api/workspaces');
  },

  async getWorkspace(id: string) {
    return fetchApi(`/api/workspaces/${id}`);
  },

  async createWorkspace(data: CreateWorkspaceInput) {
    return fetchApi('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateWorkspace(id: string, data: UpdateWorkspaceInput) {
    return fetchApi(`/api/workspaces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteWorkspace(id: string) {
    return fetchApi(`/api/workspaces/${id}`, {
      method: 'DELETE',
    });
  },

  // Subtasks
  async createSubtask(taskId: string, title: string) {
    return fetchApi('/api/subtasks', {
      method: 'POST',
      body: JSON.stringify({ taskId, title }),
    });
  },

  async toggleSubtask(id: string, completed: boolean) {
    return fetchApi(`/api/subtasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  async deleteSubtask(id: string) {
    return fetchApi(`/api/subtasks/${id}`, {
      method: 'DELETE',
    });
  },
};
