'use client';

import { useState, use, useEffect, useCallback } from 'react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskListView } from '@/components/tasks/TaskListView';
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar';
import { TaskModal } from '@/components/tasks/TaskModal';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { Task, TaskStatus, TaskFormData, ViewMode, Workspace } from '@/types';
import { getWorkspace } from '@/actions/workspaceActions';
import { getTasks, createTask, updateTask, deleteTask, updateTaskStatus } from '@/actions/taskActions';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const projectId = resolvedParams.projectId;

  const [project, setProject] = useState<Workspace | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.KANBAN);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projectData, tasksData] = await Promise.all([
        getWorkspace(projectId),
        getTasks({}),
      ]);
      setProject(projectData);
      const filteredTasks = (tasksData as Task[]).filter(t => t.workspaceId === projectId);
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!project && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
        <p className="text-gray-500 mb-4">The project you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleSaveTask = async (taskData: TaskFormData) => {
    try {
      if (editingTask) {
        const result = await updateTask(editingTask.id, {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
        });
        if (result.success && result.data) {
          setTasks(prev => prev.map(t => t.id === editingTask.id ? result.data! : t));
        }
      } else {
        const result = await createTask({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          workspaceId: projectId,
        });
        if (result.success && result.data) {
          setTasks(prev => [...prev, result.data!]);
        }
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await deleteTask(taskId, projectId);
      if (result.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    const result = await updateTaskStatus(taskId, newStatus, projectId);
    if (!result.success) {
      setTasks(previousTasks);
      console.error('Failed to update task status');
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    switch (viewMode) {
      case ViewMode.LIST:
        return (
          <TaskListView
            tasks={tasks}
            onTaskClick={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
          />
        );
      case ViewMode.CALENDAR:
        return (
          <MonthlyCalendar
            tasks={tasks}
            onTaskClick={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            onDateClick={(date) => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          />
        );
      default:
        return (
          <KanbanBoard
            tasks={tasks}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        );
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <ProjectHeader
        project={project}
        currentView={viewMode}
        onViewChange={setViewMode}
        onAddTask={handleAddTask}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{tasks.length} tasks</span>
          <span>•</span>
          <span>{tasks.filter(t => t.status === TaskStatus.DONE).length} completed</span>
        </div>
      </div>

      {renderView()}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </>
  );
}
