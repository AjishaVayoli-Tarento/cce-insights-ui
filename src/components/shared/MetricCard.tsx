import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({ title, value, subtitle, icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '▲' : '▼'} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-3 flex-shrink-0 rounded-lg bg-blue-50 p-2.5 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
