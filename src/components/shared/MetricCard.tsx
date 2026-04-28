import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
  linkTo?: string;
}

export function MetricCard({ title, value, subtitle, description, icon, trend, trendUp, linkTo }: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${linkTo ? 'cursor-pointer transition-colors hover:border-blue-300 hover:bg-blue-50/30' : ''}`}
      onClick={linkTo ? () => navigate(linkTo) : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            {description && showTooltip && (
              <div className="absolute bottom-full left-0 z-30 mb-2 w-64 rounded-lg border border-gray-200 bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
                {description}
                <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-gray-800" />
              </div>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
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
