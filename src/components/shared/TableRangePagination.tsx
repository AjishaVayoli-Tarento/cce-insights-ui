interface TableRangePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function TableRangePagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: TableRangePaginationProps) {
  if (totalCount === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const canPrevious = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-3">
      <span className="text-sm text-gray-600">
        {start}-{end} of {totalCount}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrevious}
          aria-label="Previous page"
          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="text-lg leading-none" aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          aria-label="Next page"
          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="text-lg leading-none" aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}
