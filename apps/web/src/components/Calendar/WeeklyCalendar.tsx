import { useState } from 'react';
import { format, startOfWeek, addDays, isToday, addWeeks, subWeeks } from 'date-fns';
import { Task } from '../../types/task';
import { useCalendar } from '../../hooks/useCalendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function WeeklyCalendar({ tasks, onTaskClick }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const { tasksByDay, priorityColors } = useCalendar(tasks, currentDate);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const timeSlots = hours.map(hour => format(new Date().setHours(hour, 0, 0, 0), 'HH:mm'));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">
          {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
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
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-8 border-b border-gray-100">
        <div className="p-3 text-sm text-gray-500 text-center">Time</div>
        {weekDays.map(day => (
          <div
            key={day.toISOString()}
            className={`p-3 text-center border-l border-gray-100 ${
              isToday(day) ? 'bg-indigo-50' : ''
            }`}
          >
            <div className="text-xs text-gray-500 uppercase">{format(day, 'EEE')}</div>
            <div className={`text-lg font-bold ${isToday(day) ? 'text-indigo-600' : 'text-gray-900'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-auto max-h-[600px]">
        <div className="grid grid-cols-8">
          <div className="sticky left-0 bg-white z-10">
            {timeSlots.map(time => (
              <div key={time} className="h-12 px-3 text-xs text-gray-400 text-right border-b border-r border-gray-100">
                {time}
              </div>
            ))}
          </div>

          {weekDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDay[dateKey] || [];

            return (
              <div key={dateKey} className="relative border-l border-gray-100">
                {timeSlots.map((_, hourIndex) => (
                  <div
                    key={hourIndex}
                    className="h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  />
                ))}

                {dayTasks.map(task => {
                  const taskDate = task.start;
                  const hour = taskDate.getHours();
                  const top = hour * 48;

                  return (
                    <button
                      key={task.id}
                      onClick={() => {
                        const fullTask = tasks.find(t => t.id === task.id);
                        if (fullTask) onTaskClick(fullTask);
                      }}
                      className={`
                        absolute left-1 right-1 rounded-lg px-2 py-1 text-xs text-white truncate
                        ${priorityColors[task.priority]}
                      `}
                      style={{ top: `${top}px`, height: '48px' }}
                    >
                      {task.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
