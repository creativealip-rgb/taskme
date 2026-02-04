'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PROJECTS } from '@/lib/mockData';
import {
  LayoutDashboard,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FolderKanban,
} from 'lucide-react';

interface SidebarProps {
  viewMode: string;
  onViewModeChange: (mode: string) => void;
}

export function Sidebar({ viewMode, onViewModeChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskMe
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 px-4 py-2">
              <FolderKanban className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</span>
            </div>
            <div className="space-y-1 mt-1">
              {PROJECTS.map((project) => {
                const isActive = pathname === `/projects/${project.id}`;
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 shrink-0">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors mt-1">
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
