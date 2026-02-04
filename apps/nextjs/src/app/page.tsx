'use client';

import { useState, useEffect, useCallback } from 'react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar';
import { Task, TaskStatus, TaskFormData, Workspace } from '@/types';
import { ViewMode } from '@/types';
import { GreetingHeader } from '@/components/dashboard/GreetingHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { getTasks, createTask, updateTask, deleteTask, updateTaskStatus } from '@/actions/taskActions';
import { getWorkspaces } from '@/actions/workspaceActions';
import { Calendar, CheckCircle2, Clock, FolderKanban } from 'lucide-react';

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<string>(ViewMode.KANBAN);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [tasksData, workspacesData] = await Promise.all([
        getTasks({ search: searchQuery }),
        getWorkspaces(),
      ]);
      setTasks(tasksData);
      setWorkspaces(workspacesData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          workspaceId: selectedProject || undefined,
        });
        if (result.success && result.data) {
          setTasks(prev => [...prev, result.data!]);
        }
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to save task:', err);
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await deleteTask(taskId);
      if (result.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    const result = await updateTaskStatus(taskId, newStatus, task.workspaceId);
    if (!result.success) {
      setTasks(previousTasks);
      console.error('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProject = !selectedProject || task.workspaceId === selectedProject;
    return matchesSearch && matchesProject;
  });

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate === today).length;
  const completedCount = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const totalProjects = new Set(tasks.map(t => t.workspaceId).filter(Boolean)).size;

  return (
    <>
      <GreetingHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Tasks"
          value={tasks.length}
          icon={<Clock className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="In Progress"
          value={tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
        />
        <StatsCard
          title="Projects"
          value={totalProjects}
          icon={<FolderKanban className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Tasks</h2>
              <div className="flex items-center gap-3">
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value || null)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Projects</option>
                  {workspaces.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {viewMode === ViewMode.CALENDAR ? (
                  <button
                    onClick={() => setViewMode(ViewMode.KANBAN)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    title="Switch to Kanban"
                  >
                    <FolderKanban className="w-4 h-4 text-gray-600" />
                  </button>
                ) : (
                  <button
                    onClick={() => setViewMode(ViewMode.CALENDAR)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    title="Switch to Calendar"
                  >
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {viewMode === ViewMode.CALENDAR ? (
              <MonthlyCalendar
                tasks={filteredTasks}
                onTaskClick={(task) => {
                  setEditingTask(task);
                  setIsModalOpen(true);
                }}
                onDateClick={(date) => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
              />
            ) : (
              <KanbanBoard
                tasks={filteredTasks}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <RecentActivity tasks={tasks} limit={8} />
          </div>
        </div>
      )}

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
