'use client';

import { Task, TaskStatus, TaskPriority } from '@/types';
import { getUserById } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Circle, CheckCircle2, Clock, Flag } from 'lucide-react';

interface TaskListItemProps {
  task: Task;
  onClick: () => void;
}

const statusIcons = {
  [TaskStatus.TODO]: Circle,
  [TaskStatus.IN_PROGRESS]: Clock,
  [TaskStatus.DONE]: CheckCircle2,
};

const statusColors = {
  [TaskStatus.TODO]: 'text-gray-400',
  [TaskStatus.IN_PROGRESS]: 'text-blue-500',
  [TaskStatus.DONE]: 'text-emerald-500',
};

const priorityColors = {
  [TaskPriority.HIGH]: 'text-red-500',
  [TaskPriority.MEDIUM]: 'text-amber-500',
  [TaskPriority.LOW]: 'text-blue-500',
};

const priorityLabels = {
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.LOW]: 'Low',
};

export function TaskListItem({ task, onClick }: TaskListItemProps) {
  const user = getUserById(task.userId);
  const StatusIcon = statusIcons[task.status];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 px-4 py-3 border-b border-gray-100 cursor-pointer',
        'hover:bg-gray-50 transition-colors',
        'last:border-b-0'
      )}
    >
      <StatusIcon className={cn('w-5 h-5 flex-shrink-0', statusColors[task.status])} />

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-gray-900 truncate',
          task.status === TaskStatus.DONE && 'line-through text-gray-500'
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={cn('flex items-center gap-1 text-xs font-medium', priorityColors[task.priority])}>
          <Flag className="w-3 h-3" />
          {priorityLabels[task.priority]}
        </span>

        {task.dueDate && (
          <span className={cn(
            'text-xs',
            isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
          )}>
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}

        {user && (
          <img
            src={user.image}
            alt={user.name}
            className="w-6 h-6 rounded-full"
            title={user.name}
          />
        )}
      </div>
    </div>
  );
}
