'use client';

import { Task } from '@/types';
import { TaskListItem } from './TaskListItem';

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TaskListView({ tasks, onTaskClick }: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-sm">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="flex-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</span>
        <span className="w-24 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Priority</span>
        <span className="w-20 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Due Date</span>
        <span className="w-12 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Assignee</span>
      </div>
      <div className="divide-y divide-gray-100">
        {tasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
}
