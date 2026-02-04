import { useState, useEffect, useCallback } from 'react';
import { tasksApi, subtasksApi, ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskStatus, TaskPriority, TaskFilters, Subtask } from '../types/task';
import { ApiValidationError } from '../components/TaskModal';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  validationErrors: ApiValidationError[] | null;
  addTask: (taskData: Omit<Task, 'id'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, newStatus: TaskStatus) => Promise<void>;
  changePriority: (id: string, newPriority: TaskPriority) => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
  searchTasks: (query: string) => Task[];
  filterTasks: (filters: TaskFilters) => Task[];
  refreshTasks: (filters?: Partial<TaskFilters>) => Promise<void>;
  clearErrors: () => void;
  addSubtask: (taskId: string, title: string) => Promise<Subtask>;
  toggleSubtask: (subtaskId: string) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ApiValidationError[] | null>(null);

  const clearErrors = useCallback(() => {
    setError(null);
    setValidationErrors(null);
  }, []);

  const fetchTasks = useCallback(async (filters: Partial<TaskFilters> = {}) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      setValidationErrors(null);
      const response = await tasksApi.getAll(filters);
      setTasks(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id'>) => {
    try {
      setError(null);
      setValidationErrors(null);
      const response = await tasksApi.create(taskData);
      const newTask = response.data;
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        setValidationErrors(err.getValidationErrors());
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
        setError(errorMessage);
      }
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      setValidationErrors(null);
      const response = await tasksApi.update(id, updates);
      const updatedTask = response.data;
      setTasks(prev => prev.map(task =>
        task.id === id ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        setValidationErrors(err.getValidationErrors());
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
        setError(errorMessage);
      }
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null);
      setValidationErrors(null);
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const moveTask = useCallback(async (id: string, newStatus: TaskStatus) => {
    await updateTask(id, { status: newStatus });
  }, [updateTask]);

  const changePriority = useCallback(async (id: string, newPriority: TaskPriority) => {
    await updateTask(id, { priority: newPriority });
  }, [updateTask]);

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const searchTasks = useCallback((query: string) => {
    if (!query.trim()) return tasks;
    const lowerQuery = query.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(lowerQuery) ||
      (task.description && task.description.toLowerCase().includes(lowerQuery))
    );
  }, [tasks]);

  const filterTasks = useCallback((filters: TaskFilters) => {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      return true;
    });
  }, [tasks]);

  const addSubtask = useCallback(async (taskId: string, title: string): Promise<Subtask> => {
    try {
      setError(null);
      const response = await subtasksApi.create(taskId, title);
      const newSubtask = response.data;

      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: [...(task.subtasks || []), newSubtask],
          };
        }
        return task;
      }));

      return newSubtask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add subtask';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const toggleSubtask = useCallback(async (subtaskId: string): Promise<void> => {
    try {
      setError(null);
      const response = await subtasksApi.toggle(subtaskId);
      const updatedSubtask = response.data;

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: (task.subtasks || []).map(st =>
          st.id === subtaskId ? updatedSubtask : st
        ),
      })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle subtask';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteSubtask = useCallback(async (subtaskId: string): Promise<void> => {
    try {
      setError(null);
      await subtasksApi.delete(subtaskId);

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: (task.subtasks || []).filter(st => st.id !== subtaskId),
      })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete subtask';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    tasks,
    isLoading,
    error,
    validationErrors,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    changePriority,
    getTasksByStatus,
    searchTasks,
    filterTasks,
    refreshTasks: fetchTasks,
    clearErrors,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  };
};
