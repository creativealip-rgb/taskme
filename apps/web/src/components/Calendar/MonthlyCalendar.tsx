import { useState } from 'react';
import { format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Task } from '../../types/task';
import { useCalendar } from '../../hooks/useCalendar';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface MonthlyCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: Date) => void;
  onAddTask: (date: Date) => void;
}

export function MonthlyCalendar({ tasks, onTaskClick, onDateClick, onAddTask }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { monthDays, tasksByDay, priorityColors } = useCalendar(tasks, currentDate);

  const today = new Date();

  const firstDayOfMonth = monthDays[0];
  const startPadding = firstDayOfMonth.getDay();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

      <div className="grid grid-cols-7 border-b border-gray-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`padding-${i}`} className="min-h-[100px] bg-gray-50 border-b border-r border-gray-100" />
        ))}

        {monthDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDay[dateKey] || [];
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={dateKey}
              onClick={() => onDateClick(day)}
              className={`
                min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer transition-colors
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50'}
                ${isToday ? 'bg-indigo-50' : ''}
              `}
            >
              <div className={`
                w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1
                ${isToday ? 'bg-indigo-600 text-white font-bold' : ''}
              `}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      const fullTask = tasks.find(t => t.id === task.id);
                      if (fullTask) onTaskClick(fullTask);
                    }}
                    className={`
                      w-full px-1 py-0.5 rounded text-xs text-left truncate
                      ${priorityColors[task.priority]} text-white
                    `}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    +{dayTasks.length - 3} more
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTask(day);
                  }}
                  className="w-full flex items-center justify-center py-0.5 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded opacity-0 hover:opacity-100 transition-all"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
