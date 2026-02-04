export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum ViewMode {
  KANBAN = 'kanban',
  LIST = 'list',
  CALENDAR = 'calendar'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export interface TaskFilters {
  status: TaskStatus | null;
  priority: TaskPriority | null;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isPublic: boolean;
  shareToken?: string;
  createdAt?: string;
  updatedAt?: string;
}
