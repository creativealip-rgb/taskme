import { TaskCard } from './TaskCard';
import { TaskStatus, TaskPriority, Task, TaskFilters } from '../types/task';

interface ListViewProps {
  tasks: Task[];
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const ListView = ({ tasks, filters, onFilterChange, onEditTask, onDeleteTask }: ListViewProps) => {
  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as TaskStatus || null })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.DONE}>Done</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Priority:</label>
          <select
            value={filters.priority || ''}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value as TaskPriority || null })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
          </select>
        </div>

        <button
          onClick={() => onFilterChange({ status: null, priority: null })}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Clear filters
        </button>

        <div className="ml-auto text-sm text-gray-600">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            isKanban={true}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No tasks found matching your filters</p>
        </div>
      )}
    </div>
  );
};
