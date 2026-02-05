'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ViewMode } from '@/types';
import { AuthProvider } from '@/components/auth/AuthProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<string>(ViewMode.KANBAN);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div className="ml-64">
          <Header
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddTask={() => {}}
            onShare={() => {}}
            taskCount={0}
            completedCount={0}
            todayCount={0}
            user={{
              name: 'Alex Johnson',
              email: 'alex@example.com',
              image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            }}
          />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
