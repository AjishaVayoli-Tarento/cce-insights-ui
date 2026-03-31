import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, children, className = '', action }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          {title && <h3 className="text-sm font-semibold text-gray-700">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
