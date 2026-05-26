interface CursorPaginationProps {
  hasMore: boolean;
  nextCursor: string | null;
  onNext: (cursor: string) => void;
  onPrevious?: () => void;
  onReset: () => void;
  currentPage?: number;
}

export function CursorPagination({ hasMore, nextCursor, onNext, onPrevious, onReset, currentPage = 1 }: CursorPaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
      <p className="text-xs text-gray-500">Page {currentPage}</p>
      <div className="flex gap-2">
        {currentPage > 1 && (
          <button
            onClick={onReset}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            ⟪ First
          </button>
        )}
        {currentPage > 1 && onPrevious && (
          <button
            onClick={onPrevious}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Previous
          </button>
        )}
        {hasMore && nextCursor && (
          <button
            onClick={() => onNext(nextCursor)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
