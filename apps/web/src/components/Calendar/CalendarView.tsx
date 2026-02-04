import { useState } from 'react';
import { Task } from '../../types/task';
import { MonthlyCalendar } from './MonthlyCalendar';
import { WeeklyCalendar } from './WeeklyCalendar';
import { Calendar as CalendarIcon, List } from 'lucide-react';
import { CalendarViewMode } from '../../types/calendar';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateSelect: (date: Date) => void;
  onAddTask: (date?: Date) => void;
}

export function CalendarView({ tasks, onTaskClick, onDateSelect, onAddTask }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('month')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
            `}
          >
            <CalendarIcon className="w-4 h-4" />
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
            `}
          >
            <List className="w-4 h-4" />
            Week
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <MonthlyCalendar
          tasks={tasks}
          onTaskClick={onTaskClick}
          onDateClick={onDateSelect}
          onAddTask={onAddTask}
        />
      ) : (
        <WeeklyCalendar
          tasks={tasks}
          onTaskClick={onTaskClick}
        />
      )}
    </div>
  );
}
