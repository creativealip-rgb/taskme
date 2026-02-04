'use client';

import { useState } from 'react';
import { format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface MonthlyCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: Date) => void;
}

export function MonthlyCalendar({ tasks, onTaskClick, onDateClick }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startPadding = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const getTasksForDay = (day: number) => {
    const dateStr = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), 'yyyy-MM-dd');
    return tasks.filter(task => task.dueDate === dateStr);
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-rose-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`padding-${i}`} className="min-h-[100px] bg-gray-50 border-b border-r border-gray-100" />
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
          const day = dayIndex + 1;
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), today);
          const dateStr = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), 'yyyy-MM-dd');

          return (
            <div
              key={day}
              onClick={() => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={cn(
                'min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer transition-colors',
                'hover:bg-gray-50',
                isToday ? 'bg-indigo-50' : ''
              )}
            >
              <div className={cn(
                'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                isToday ? 'bg-indigo-600 text-white font-bold' : ''
              )}>
                {day}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    className={cn(
                      'w-full px-1 py-0.5 rounded text-xs text-left truncate',
                      priorityColors[task.priority] || 'bg-gray-500',
                      'text-white'
                    )}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
