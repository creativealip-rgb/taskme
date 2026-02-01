import { ViewMode } from '../types/task';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddTask: () => void;
  taskCount: number;
}

export const Header = ({ viewMode, onViewModeChange, searchQuery, onSearchChange, onAddTask, taskCount }: HeaderProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {taskCount} tasks
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-red-600 hover:text-red-500 font-medium"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tasks..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => onViewModeChange(ViewMode.KANBAN)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === ViewMode.KANBAN
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Board
              </button>
              <button
                onClick={() => onViewModeChange(ViewMode.LIST)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === ViewMode.LIST
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                List
              </button>
            </div>

            <button
              onClick={onAddTask}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
