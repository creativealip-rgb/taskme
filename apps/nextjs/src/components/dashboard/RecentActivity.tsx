'use client';

import { Task, TaskStatus, TaskPriority } from '@/types';
import { getUserById, getProjectById } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RecentActivityProps {
  tasks: Task[];
  limit?: number;
}

const statusLabels = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
};

const statusColors = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-700',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [TaskStatus.DONE]: 'bg-emerald-100 text-emerald-700',
};

const priorityColors = {
  [TaskPriority.HIGH]: 'text-red-500',
  [TaskPriority.MEDIUM]: 'text-amber-500',
  [TaskPriority.LOW]: 'text-blue-500',
};

export function RecentActivity({ tasks, limit = 5 }: RecentActivityProps) {
  const sortedTasks = [...tasks]
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {sortedTasks.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-500 text-sm">
            No recent activity
          </div>
        ) : (
          sortedTasks.map((task) => {
            const user = getUserById(task.userId);
            const project = getProjectById(task.workspaceId || '');

            return (
              <div
                key={task.id}
                className="px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </span>
                      {project && (
                        <span
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            backgroundColor: `${project.color}20`,
                            color: project.color,
                          }}
                        >
                          {project.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {user && (
                        <span className="flex items-center gap-1">
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-4 h-4 rounded-full"
                          />
                          {user.name}
                        </span>
                      )}
                      <span>•</span>
                      <span className={cn('flex items-center gap-1', priorityColors[task.priority])}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[task.status])}>
                      {statusLabels[task.status]}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
