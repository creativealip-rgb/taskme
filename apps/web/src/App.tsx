import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { TaskModal } from './components/TaskModal';
import { CalendarView } from './components/Calendar';
import { ShareModal } from './components/ShareModal';
import { ViewMode, Task, TaskFormData, TaskStatus, TaskFilters, Workspace } from './types/task';
import { tasksApi, workspacesApi } from './services/api';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.KANBAN);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({ status: null, priority: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tasksApi.getAll();
      setTasks(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWorkspace = useCallback(async () => {
    try {
      const response = await workspacesApi.getAll();
      if (response.data && response.data.length > 0) {
        setCurrentWorkspace(response.data[0]);
      } else {
        const createResponse = await workspacesApi.create('My Workspace', 'Default workspace');
        setCurrentWorkspace(createResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch workspace:', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchWorkspace();
    }
  }, [isAuthenticated, fetchTasks, fetchWorkspace]);

  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setSelectedDueDate('');
    setIsModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(async (taskData: TaskFormData) => {
    try {
      if (editingTask) {
        const response = await tasksApi.update(editingTask.id, taskData);
        setTasks(prev => prev.map(t => t.id === editingTask.id ? response.data : t));
      } else {
        const response = await tasksApi.create(taskData);
        setTasks(prev => [...prev, response.data]);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to save task:', err);
      throw err;
    }
  }, [editingTask]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }, []);

  const handleMoveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await tasksApi.update(taskId, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? response.data : t));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  }, [tasks]);

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setEditingTask(null);
    setSelectedDueDate(dateStr);
    setIsModalOpen(true);
  };

  const handleTaskClick = useCallback((task: Task) => {
    handleEditTask(task);
  }, [handleEditTask]);

  const handleAddTaskFromCalendar = useCallback((date?: Date) => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      setEditingTask(null);
      setSelectedDueDate(dateStr);
    } else {
      setEditingTask(null);
      setSelectedDueDate('');
    }
    setIsModalOpen(true);
  }, []);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.dueDate === today).length;
  const completedCount = tasks.filter(t => t.status === TaskStatus.DONE).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h1>
          <p className="text-gray-600">You need to authenticate to access your tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddTask={handleAddTask}
        onShare={() => setIsShareModalOpen(true)}
        taskCount={tasks.length}
        completedCount={completedCount}
        todayCount={todayTasks}
        onSidebarOpen={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddTask={handleAddTask}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        taskCount={tasks.length}
        completedCount={completedCount}
        todayCount={todayTasks}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : viewMode === ViewMode.CALENDAR ? (
          <CalendarView
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onDateSelect={handleDateSelect}
            onAddTask={handleAddTaskFromCalendar}
          />
        ) : viewMode === ViewMode.LIST ? (
          <ListView
            tasks={filteredTasks}
            filters={filters}
            onFilterChange={setFilters}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
          />
        )}
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        initialDueDate={selectedDueDate}
      />

      {currentWorkspace && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          workspace={currentWorkspace}
        />
      )}
    </div>
  );
}

export default App;
