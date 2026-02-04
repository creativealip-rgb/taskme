'use client';

import { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onPriorityChange?: (taskId: string, newPriority: TaskPriority) => void;
  isKanban?: boolean;
}

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [TaskPriority.MEDIUM]: 'bg-amber-100 text-amber-700 border-amber-200',
  [TaskPriority.HIGH]: 'bg-rose-100 text-rose-700 border-rose-200',
};

const priorityIcons: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '↓',
  [TaskPriority.MEDIUM]: '→',
  [TaskPriority.HIGH]: '↑',
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  isKanban = false,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md',
        task.status === TaskStatus.DONE ? 'opacity-75' : '',
        'border-gray-100 hover:border-gray-200'
      )}
      onClick={() => onEdit(task)}
    >
      <div className="p-4">
        {/* Header: Priority & Menu */}
        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            'px-2 py-1 rounded-lg text-xs font-medium border',
            priorityColors[task.priority]
          )}>
            {priorityIcons[task.priority]} {task.priority}
          </span>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-semibold text-gray-900 mb-2',
          task.status === TaskStatus.DONE && 'line-through text-gray-400'
        )}>
          {task.title}
        </h3>

        {/* Description Preview */}
        {task.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer: Due Date & Subtasks */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          {totalSubtasks > 0 && (
            <span className="text-xs text-gray-400">
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
