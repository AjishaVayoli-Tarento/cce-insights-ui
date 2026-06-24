import { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface PagePaginationProps {
  pageSize: number;
  pageSizeOptions?: number[];
  onPageSizeChange: (size: number) => void;
  start: number;
  end: number;
  totalCount?: number;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
}

export function PagePagination({
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  start,
  end,
  totalCount,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
}: PagePaginationProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const rangeLabel = totalCount != null
    ? `${start}-${end} of ${totalCount}`
    : `${start}-${end}`;

  return (
    <div className="mt-4 flex items-center justify-end gap-4 border-t border-gray-100 pt-3">
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {pageSize} per page
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute bottom-full right-0 z-20 mb-1 min-w-[9rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {pageSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                role="option"
                aria-selected={size === pageSize}
                onClick={() => {
                  onPageSizeChange(size);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  size === pageSize ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  {size === pageSize && <CheckIcon className="h-4 w-4" />}
                </span>
                {size} per page
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="text-sm text-gray-600">{rangeLabel}</span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canPrevious}
          aria-label="Previous page"
          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="text-lg leading-none" aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next page"
          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="text-lg leading-none" aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}
