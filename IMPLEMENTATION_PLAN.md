# Task Manager - Implementation Plan

## Project Overview

A full-featured task management application for personal use and small teams, built with:
- **Frontend:** React + Vite + TypeScript
- **Backend:** Express + Drizzle ORM
- **Database:** SQLite (better-sqlite3)
- **Auth:** Better-Auth
- **Deployment:** Docker

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Stack                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Nginx     │  │   React     │  │      Express        │  │
│  │  (Reverse   │  │   Web App   │  │       API           │  │
│  │   Proxy)    │  │   :5173     │  │      :3000          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                                    │               │
│  ┌──────┴──────┐                            │               │
│  │   Port 80    │                            │               │
│  │   Port 443   │                            │               │
│  └─────────────┘                            │               │
│                                             │               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SQLite Database (sqlite.db)            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: PWA Support

### Goals
- Enable offline task viewing
- Add to home screen capability
- Mobile app-like experience
- Push notifications (optional)

### Tasks

#### 1.1 Install PWA Dependencies
```bash
cd apps/web
pnpm add -D vite-plugin-pwa workbox-window
```

#### 1.2 Configure Vite PWA Plugin
**File:** `apps/web/vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'TaskMe - Task Manager',
        short_name: 'TaskMe',
        description: 'A modern task manager for personal and team productivity',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
```

#### 1.3 Create Icons
- Create `apps/web/public/icons/` directory
- Add icon-192.png (192x192)
- Add icon-512.png (512x512)
- Use maskable icon for adaptive backgrounds

#### 1.4 Add PWA Components
**File:** `apps/web/src/components/PWAInstallPrompt.tsx`
```typescript
import { useEffect, useState } from 'react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 z-50">
      <p className="text-sm text-gray-700 mb-3">
        Install TaskMe as an app for faster access
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
        >
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="px-4 py-2 text-gray-500 text-sm"
        >
          Later
        </button>
      </div>
    </div>
  );
}
```

#### 1.5 Register Service Worker
**File:** `apps/web/src/main.tsx`
```typescript
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedRefresh() {
    // Show refresh prompt
    if (confirm('New content available. Reload?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  }
});
```

#### 1.6 Offline Indicator Component
**File:** `apps/web/src/components/OfflineIndicator.tsx`
```typescript
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 text-sm z-50">
      You're offline. Changes will sync when connection is restored.
    </div>
  );
}
```

**File:** `apps/web/src/hooks/useOnlineStatus.ts`
```typescript
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Deliverables
- [ ] PWA configured in vite.config.ts
- [ ] App icons created
- [ ] Install prompt component
- [ ] Offline indicator component
- [ ] Service worker registered

---

## Phase 2: Calendar View

### Goals
- Monthly calendar view
- Weekly calendar view
- Task visualization on calendar
- Date picker for task creation/editing

### Tasks

#### 2.1 Install Calendar Dependencies
```bash
cd apps/web
pnpm add react-big-calendar date-fns @types/react-big-calendar
```

#### 2.2 Create Calendar Types
**File:** `apps/web/src/types/calendar.ts`
```typescript
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  allDay?: boolean;
}

export interface CalendarTask {
  id: string;
  title: string;
  dueDate?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}
```

#### 2.3 Create Calendar Hook
**File:** `apps/web/src/hooks/useCalendar.ts`
```typescript
import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
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
    [TaskStatus.TODO]: 'bg-gray-300',
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
```

#### 2.4 Create Monthly Calendar Component
**File:** `apps/web/src/components/Calendar/MonthlyCalendar.tsx`
```typescript
import { useState } from 'react';
import { format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Task } from '../../types/task';
import { useCalendar } from '../../hooks/useCalendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: Date) => void;
}

export function MonthlyCalendar({ tasks, onTaskClick, onDateClick }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { monthDays, tasksByDay, priorityColors } = useCalendar(tasks, currentDate);

  const today = new Date();

  const firstDayOfMonth = monthDays[0];
  const startPadding = firstDayOfMonth.getDay();

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
        {/* Empty cells for padding */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`padding-${i}`} className="min-h-[100px] bg-gray-50 border-b border-r border-gray-100" />
        ))}

        {/* Calendar days */}
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
                      // Open day view with all tasks
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    +{dayTasks.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### 2.5 Create Weekly Calendar Component
**File:** `apps/web/src/components/Calendar/WeeklyCalendar.tsx`
```typescript
import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
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
      {/* Header */}
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

      {/* Week Days Header */}
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

      {/* Time Grid */}
      <div className="overflow-auto max-h-[600px]">
        <div className="grid grid-cols-8">
          {/* Time Column */}
          <div className="sticky left-0 bg-white z-10">
            {timeSlots.map(time => (
              <div key={time} className="h-12 px-3 text-xs text-gray-400 text-right border-b border-r border-gray-100">
                {time}
              </div>
            ))}
          </div>

          {/* Day Columns */}
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
                
                {/* Task Markers */}
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
```

#### 2.6 Create Calendar View Wrapper
**File:** `apps/web/src/components/Calendar/CalendarView.tsx`
```typescript
import { useState } from 'react';
import { format } from 'date-fns';
import { Task } from '../../types/task';
import { MonthlyCalendar } from './MonthlyCalendar';
import { WeeklyCalendar } from './WeeklyCalendar';
import { Calendar as CalendarIcon, List } from 'lucide-react';

type ViewMode = 'month' | 'week';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateSelect: (date: Date) => void;
}

export function CalendarView({ tasks, onTaskClick, onDateSelect }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
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

      {/* Calendar */}
      {viewMode === 'month' ? (
        <MonthlyCalendar
          tasks={tasks}
          onTaskClick={onTaskClick}
          onDateClick={onDateSelect}
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
```

#### 2.7 Integrate Calendar into App
**File:** `apps/web/src/App.tsx` - Add calendar view mode
```typescript
// Add to ViewMode enum
enum ViewMode {
  KANBAN = 'kanban',
  LIST = 'list',
  CALENDAR_MONTH = 'calendar_month',
  CALENDAR_WEEK = 'calendar_week'
}

// Add calendar import
import { CalendarView } from './components/Calendar/CalendarView';

// In TaskManager component, add calendar rendering
{viewMode === ViewMode.CALENDAR_MONTH || viewMode === ViewMode.CALENDAR_WEEK ? (
  <CalendarView
    tasks={filteredTasks}
    onTaskClick={handleEditTask}
    onDateSelect={(date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      handleAddTask();
      // Pre-fill due date
    }}
  />
) : viewMode === ViewMode.KANBAN ? (
  <KanbanBoard ... />
) : (
  <ListView ... />
)}
```

### Deliverables
- [ ] Calendar dependencies installed
- [ ] Calendar types defined
- [ ] useCalendar hook created
- [ ] MonthlyCalendar component
- [ ] WeeklyCalendar component
- [ ] CalendarView wrapper
- [ ] Calendar integrated into App.tsx

---

## Phase 3: Workspace Sharing

### Goals
- Public workspace URLs
- Shareable links with workspace IDs
- View-only access for visitors
- Copy link functionality

### Tasks

#### 3.1 Update Database Schema
**File:** `apps/api/src/db/schema.ts`
```typescript
// Add workspace table
export const workspaces = sqliteTable(
  'workspaces',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    isPublic: integer('is_public', { mode: 'boolean' })
      .default(false)
      .notNull(),
    shareToken: text('share_token').unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('workspaces_ownerId_idx').on(table.ownerId)]
);

// Update tasks table to include workspaceId
export const tasks = sqliteTable(
  'tasks',
  {
    // ... existing fields
    workspaceId: text('workspace_id')
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    // ... rest of fields
  }
);

// Add relations
export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(user, {
    fields: [workspaces.ownerId],
    references: [user.id],
  }),
  tasks: many(tasks),
}));
```

#### 3.2 Create Workspace Service
**File:** `apps/api/src/services/workspace.service.ts`
```typescript
import { eq } from 'drizzle-orm';
import { db, workspaces, type Workspace, type NewWorkspace } from '../db/index.js';

export class WorkspaceService {
  async createWorkspace(userId: string, name: string, description?: string): Promise<Workspace> {
    const shareToken = crypto.randomUUID().slice(0, 8);
    
    const workspace: NewWorkspace = {
      id: crypto.randomUUID(),
      name,
      description: description ?? null,
      ownerId: userId,
      isPublic: false,
      shareToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(workspaces).values(workspace);
    return workspace as Workspace;
  }

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    const result = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async getWorkspaceByShareToken(token: string): Promise<Workspace | null> {
    const result = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.shareToken, token))
      .limit(1);
    return result[0] ?? null;
  }

  async updateWorkspace(id: string, updates: Partial<{ name: string; description: string; isPublic: boolean }>): Promise<Workspace | null> {
    await db
      .update(workspaces)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workspaces.id, id));
    return this.getWorkspaceById(id);
  }

  async generateNewShareToken(id: string): Promise<string> {
    const newToken = crypto.randomUUID().slice(0, 8);
    await db
      .update(workspaces)
      .set({ shareToken: newToken, updatedAt: new Date() })
      .where(eq(workspaces.id, id));
    return newToken;
  }

  async togglePublic(id: string): Promise<boolean> {
    const workspace = await this.getWorkspaceById(id);
    if (!workspace) return false;
    
    await db
      .update(workspaces)
      .set({ isPublic: !workspace.isPublic, updatedAt: new Date() })
      .where(eq(workspaces.id, id));
    
    return !workspace.isPublic;
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    const workspace = await this.getWorkspaceById(id);
    if (!workspace) return false;
    
    await db.delete(workspaces).where(eq(workspaces.id, id));
    return true;
  }
}

export const workspaceService = new WorkspaceService();
```

#### 3.3 Create Workspace Routes
**File:** `apps/api/src/routes/workspaces.routes.ts`
```typescript
import { Router } from 'express';
import { z } from 'zod';
import { workspaceService } from '../services/workspace.service.js';
import { requireAuth } from '../middleware/auth.js';

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    // Get user's workspaces
    // For now, return mock data or implement
    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const input = createWorkspaceSchema.parse(req.body);
    const workspace = await workspaceService.createWorkspace(req.user!.id, input.name, input.description);
    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(req.params.id);
    if (!workspace) {
      res.status(404).json({ success: false, error: 'Workspace not found' });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const input = updateWorkspaceSchema.parse(req.body);
    const workspace = await workspaceService.updateWorkspace(req.params.id, input);
    if (!workspace) {
      res.status(404).json({ success: false, error: 'Workspace not found' });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/share-token', async (req, res, next) => {
  try {
    const token = await workspaceService.generateNewShareToken(req.params.id);
    res.json({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/toggle-public', async (req, res, next) => {
  try {
    const isPublic = await workspaceService.togglePublic(req.params.id);
    res.json({ success: true, data: { isPublic } });
  } catch (error) {
    next(error);
  }
});

// Public share link route
router.get('/share/:token', async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceByShareToken(req.params.token);
    if (!workspace) {
      res.status(404).json({ success: false, error: 'Workspace not found' });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
});

export default router;
```

#### 3.4 Create Share Modal Component
**File:** `apps/web/src/components/ShareModal.tsx`
```typescript
import { useState } from 'react';
import { Copy, Check, Globe, Lock } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  shareToken?: string;
  isPublic?: boolean;
}

export function ShareModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  shareToken,
  isPublic = false
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState('');

  const generateLink = () => {
    const url = `${window.location.origin}/share/${shareToken}`;
    setLink(url);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Share "{workspaceName}"</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Link Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Generate link to share..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                readOnly
              />
              <button
                onClick={generateLink}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Generate
              </button>
            </div>
            {link && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            )}
          </div>

          {/* Access Info */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <>
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Globe className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Public Workspace</p>
                    <p className="text-sm text-gray-500">Anyone with the link can view</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Private Workspace</p>
                    <p className="text-sm text-gray-500">Only you can access</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 3.5 Create Public Workspace Page
**File:** `apps/web/src/pages/PublicWorkspace.tsx`
```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tasksApi } from '../services/api';
import { Task } from '../types/task';
import { KanbanBoard } from '../components/KanbanBoard';
import { ListView } from '../components/ListView';
import { ViewMode } from '../types/task';

export function PublicWorkspace() {
  const { token } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.KANBAN);

  useEffect(() => {
    // Fetch public tasks using share token
    // For now, show loading or error
    setLoading(false);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Workspace Not Found</h1>
          <p className="text-gray-600">This share link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Shared Workspace</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === ViewMode.KANBAN ? (
          <KanbanBoard
            tasks={tasks}
            onEditTask={() => {}}
            onDeleteTask={() => {}}
            onMoveTask={() => {}}
            onPriorityChange={() => {}}
          />
        ) : (
          <ListView
            tasks={tasks}
            filters={{ status: null, priority: null }}
            onFilterChange={() => {}}
            onEditTask={() => {}}
            onDeleteTask={() => {}}
          />
        )}
      </main>
    </div>
  );
}
```

### Deliverables
- [ ] Database schema updated with workspaces
- [ ] Workspace service created
- [ ] Workspace routes created
- [ ] ShareModal component
- [ ] Public workspace page
- [ ] Copy link functionality

---

## Phase 4: Docker Deployment

### Goals
- Docker configuration for all services
- Docker Compose for orchestration
- Nginx reverse proxy
- SSL certificates with Let's Encrypt
- Production-ready deployment

### Tasks

#### 4.1 Create API Dockerfile
**File:** `apps/api/Dockerfile`
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start
CMD ["npm", "start"]
```

#### 4.2 Create Web Dockerfile
**File:** `apps/web/Dockerfile`
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### 4.3 Create Nginx Configuration
**File:** `apps/web/nginx.conf`
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth proxy
    location /api/auth {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 4.4 Create Docker Compose
**File:** `docker-compose.yml`
```yaml
version: '3.8'

services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    depends_on:
      api:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - ./data/web:/var/cache/nginx:ro

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=./sqlite.db
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=http://localhost:3000
      - FRONTEND_URL=http://localhost:8080
      - PORT=3000
      - NODE_ENV=production
    volumes:
      - ./data/api:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  default:
    name: task-manager-network
```

#### 4.5 Create Environment File Template
**File:** `.env.example`
```env
# API Configuration
BETTER_AUTH_SECRET=your-super-secret-key-at-least-32-characters
BETTER_AUTH_URL=http://your-domain.com
FRONTEND_URL=http://your-domain.com
PORT=3000
NODE_ENV=production
```

#### 4.6 Create Docker Compose with Nginx (Production)
**File:** `docker-compose.prod.yml`
```yaml
version: '3.8'

services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    expose:
      - "80"
    restart: unless-stopped

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    expose:
      - "3000"
    environment:
      - DATABASE_URL=./sqlite.db
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=https://${DOMAIN}
      - FRONTEND_URL=https://${DOMAIN}
      - PORT=3000
      - NODE_ENV=production
    volumes:
      - api_data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./data/certbot:/etc/letsencrypt:ro
    depends_on:
      - web
      - api
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    volumes:
      - ./data/certbot:/etc/letsencrypt
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    command: certonly --webroot --webroot-path=/var/www/certbot --email ${EMAIL} --agree-tos --no-eff-email -d ${DOMAIN}
    depends_on:
      - nginx

volumes:
  api_data:

networks:
  default:
    name: task-manager-network
```

#### 4.7 Create Deployment Script
**File:** `deploy.sh`
```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Task Manager Deployment${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env with your configuration!${NC}"
    exit 1
fi

# Build and start services
echo -e "${GREEN}📦 Building and starting containers...${NC}"
docker compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo -e "${GREEN}⏳ Waiting for services to start...${NC}"
sleep 10

# Check health
echo -e "${GREEN}🔍 Checking service health...${NC}"
curl -f http://localhost/health || echo -e "${RED}❌ API health check failed${NC}"
curl -f http://localhost:8080 || echo -e "${RED}❌ Web health check failed${NC}"

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 App available at: http://localhost${NC}"
echo -e "${GREEN}📝 API available at: http://localhost:3000${NC}"
```

#### 4.8 Create Production Nginx Config
**File:** `nginx.conf`
```nginx
server {
    listen 80;
    server_name ${DOMAIN};

    # SSL certificate locations
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # SSL configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # API proxy
    location /api {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth proxy
    location /api/auth {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Web app
    location / {
        try_files $uri $uri/ /index.html;
        root /usr/share/nginx/html;
    }
}

# HTTP to HTTPS redirect (optional, enable if using SSL)
# server {
#     listen 80;
#     server_name ${DOMAIN};
#     return 301 https://$host$request_uri;
# }
```

#### 4.9 Create .dockerignore
**File:** `.dockerignore`
```
node_modules
dist
*.log
.env
.env.local
.git
.gitignore
README.md
.DS_Store
*.db
```

#### 4.10 Create README with Deployment Instructions
**File:** `DEPLOYMENT.md`
```markdown
# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Domain name (optional, for SSL)
- Email for SSL certificate (optional)

## Quick Start (Development)

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration

3. Start services:
   ```bash
   docker compose up -d
   ```

4. Access at http://localhost:8080

## Production Deployment

### Prerequisites

- Domain name pointed to server
- Open ports 80 and 443

### Steps

1. Set environment variables:
   ```bash
   export DOMAIN=your-domain.com
   export EMAIL=your-email@example.com
   export BETTER_AUTH_SECRET=your-secret-key
   ```

2. Run deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. SSL certificates will be automatically generated by Let's Encrypt

### Manual Production Setup

1. Build images:
   ```bash
   docker compose -f docker-compose.prod.yml build
   ```

2. Start services:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

3. Obtain SSL certificates:
   ```bash
   docker compose -f docker-compose.prod.yml run certbot
   ```

4. Restart nginx with SSL:
   ```bash
   docker compose -f docker-compose.prod.yml restart nginx
   ```

## Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start all services |
| `docker compose down` | Stop all services |
| `docker compose logs -f` | View logs |
| `docker compose restart api` | Restart API only |
| `docker compose restart web` | Restart Web only |

## Troubleshooting

### API not starting
Check logs: `docker compose logs api`

### Can't connect to database
Ensure data directory exists: `mkdir -p data/api`

### SSL certificate issues
Run certbot manually:
```bash
docker compose -f docker-compose.prod.yml run certbot
```
```

### Deliverables
- [ ] API Dockerfile
- [ ] Web Dockerfile
- [ ] Nginx configuration
- [ ] Docker Compose (development)
- [ ] Docker Compose (production)
- [ ] Nginx production config with SSL
- [ ] Deployment script
- [ ] .dockerignore
- [ ] Deployment README

---

## Summary

### Phase Deliverables

| Phase | Deliverables | Estimated Time |
|-------|-------------|----------------|
| Phase 1: PWA | 5 files/components | 1 week |
| Phase 2: Calendar | 7 files/components | 2 weeks |
| Phase 3: Sharing | 5 files/components | 2 weeks |
| Phase 4: Docker | 9 files/scripts | 1 week |

### Total: ~6 weeks

### Tech Stack Summary

| Category | Technology |
|----------|------------|
| Frontend | React + Vite + TypeScript |
| Backend | Express + Drizzle ORM |
| Database | SQLite (better-sqlite3) |
| Auth | Better-Auth |
| Calendar | react-big-calendar + date-fns |
| Deployment | Docker + Nginx |

---

## Next Steps

1. Start with **Phase 1: PWA Support**
2. Move to **Phase 2: Calendar View**
3. Implement **Phase 3: Workspace Sharing**
4. Deploy with **Phase 4: Docker**

Each phase can be started independently and deployed incrementally.
