'use client';

import { useMemo } from 'react';
import { User } from '@/types';

interface GreetingHeaderProps {
  user?: User;
}

export function GreetingHeader({ user }: GreetingHeaderProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const userName = user?.name || 'there';

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {greeting}, {userName} 👋
      </h1>
      <p className="text-gray-500 text-sm">
        {formattedDate}
      </p>
    </div>
  );
}
