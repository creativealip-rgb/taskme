'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { Task, TaskStatus } from '@/types';

export default function SharePage() {
  const { token } = useParams();
  const [workspace, setWorkspace] = useState<{ name: string; description?: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<string>('kanban');

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!token) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/workspaces/public/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Workspace not found');
          return;
        }

        setWorkspace(data.data.workspace);
        setTasks(data.data.tasks || []);
      } catch (err) {
        console.error('Error fetching workspace:', err);
        setError('Failed to load workspace');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Workspace Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {workspace.name}
                </h1>
                <p className="text-xs text-gray-500">Shared Workspace</p>
              </div>
            </div>

            <a
              href="/"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg font-medium text-sm"
            >
              Create Your Own
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {workspace.description && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-blue-800">{workspace.description}</p>
          </div>
        )}

        <div className="mb-6 flex items-center gap-4">
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium">
            {tasks.length} Tasks
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium">
            {tasks.filter(t => t.status === TaskStatus.DONE).length} Done
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks yet</h3>
            <p className="text-gray-500">This workspace doesn&apos;t have any tasks to display.</p>
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onEditTask={() => {}}
            onDeleteTask={() => {}}
            onStatusChange={() => {}}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Shared via TaskMe - Your personal task manager</p>
        </div>
      </footer>
    </div>
  );
}
