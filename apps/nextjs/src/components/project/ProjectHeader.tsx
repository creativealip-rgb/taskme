'use client';

import { Workspace } from '@/types';
import { ViewMode } from '@/types';
import { cn } from '@/lib/utils';
import { Calendar, FolderKanban, List, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProjectHeaderProps {
  project: Workspace;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onAddTask: () => void;
}

export function ProjectHeader({
  project,
  currentView,
  onViewChange,
  onAddTask,
}: ProjectHeaderProps) {
  const viewOptions = [
    { mode: ViewMode.KANBAN, icon: FolderKanban, label: 'Board' },
    { mode: ViewMode.LIST, icon: List, label: 'List' },
    { mode: ViewMode.CALENDAR, icon: Calendar, label: 'Calendar' },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: (project as any).color || '#6366f1' }}
        />
        <span className="text-sm text-gray-500">Project</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              const isActive = currentView === option.mode;

              return (
                <button
                  key={option.mode}
                  onClick={() => onViewChange(option.mode)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
