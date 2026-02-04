import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { CalendarEvent } from '../types/calendar';

export function useCalendar(tasks: Task[], currentDate: Date) {
  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: new Date(task.dueDate!),
        end: new Date(task.dueDate!),
        status: task.status,
        priority: task.priority,
        allDay: true
      }));
  }, [tasks]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const taskCountByDay = useMemo(() => {
    const count: Record<string, number> = {};
    events.forEach(event => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      count[dateKey] = (count[dateKey] || 0) + 1;
    });
    return count;
  }, [events]);

  const tasksByDay = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'bg-emerald-500',
    [TaskPriority.MEDIUM]: 'bg-amber-500',
    [TaskPriority.HIGH]: 'bg-rose-500'
  };

  const statusColors: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'bg-gray-400',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-400',
    [TaskStatus.DONE]: 'bg-green-500'
  };

  return {
    events,
    monthDays,
    taskCountByDay,
    tasksByDay,
    priorityColors,
    statusColors
  };
}
