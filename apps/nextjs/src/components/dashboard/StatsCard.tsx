'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    border: 'border-blue-200',
  },
  green: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  orange: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    border: 'border-amber-200',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    border: 'border-purple-200',
  },
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
}: StatsCardProps) {
  const colors = colorVariants[color];

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all hover:shadow-md',
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-lg',
            colors.iconBg
          )}
        >
          <div className={cn(colors.iconColor)}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
