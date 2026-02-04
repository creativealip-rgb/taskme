import { TaskStatus, TaskPriority } from './task';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: TaskStatus;
  priority: TaskPriority;
  allDay?: boolean;
}

export interface CalendarTask {
  id: string;
  title: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export type CalendarViewMode = 'month' | 'week';
