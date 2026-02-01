import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { useAuth } from './contexts/AuthContext';
import { ViewMode, Task, TaskFilters, TaskFormData, TaskStatus } from './types/task';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { TaskModal } from './components/TaskModal';
import { AuthPage } from './components/AuthPage';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <TaskManager />;
}

function TaskManager() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.KANBAN);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({ status: null, priority: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    changePriority,
    searchTasks,
    validationErrors,
    clearErrors
  } = useTasks();

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    moveTask(taskId, newStatus);
  };

  // Get filtered tasks based on search and filters
  const getFilteredTasks = () => {
    let filtered = tasks;

    // Apply search
    if (searchQuery.trim()) {
      filtered = searchTasks(searchQuery);
    }

    // Apply list view filters
    if (viewMode === ViewMode.LIST) {
      filtered = filtered.filter(task => {
        if (filters.status && task.status !== filters.status) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        return true;
      });
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddTask={handleAddTask}
        taskCount={tasks.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredTasks.length === 0 && tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h2>
            <p className="text-gray-600 mb-6">Get started by creating your first task</p>
            <button
              onClick={handleAddTask}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          <>
            {viewMode === ViewMode.KANBAN ? (
              <KanbanBoard
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                onPriorityChange={changePriority}
              />
            ) : (
              <ListView
                tasks={tasks}
                filters={filters}
                onFilterChange={setFilters}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
          </>
        )}
      </main>

      <TaskModal
        key={editingTask?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          clearErrors();
        }}
        onSave={handleSaveTask}
        task={editingTask}
        apiErrors={validationErrors || undefined}
      />
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
