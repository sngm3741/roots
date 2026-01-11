import { Button } from "./button";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: "number" | "simple";
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = "number",
}: Props) {
  if (totalPages <= 1) return null;

  if (variant === "simple") {
    return (
      <div className="flex items-center justify-center gap-3 text-sm text-slate-700">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          前へ
        </Button>
        <span className="rounded-full border border-slate-100 bg-white/80 px-3 py-1 text-slate-800 shadow-sm">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          次へ
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 pt-2">
      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-8 min-w-[2rem] rounded-full px-3 text-sm font-semibold transition ${
              isActive
                ? "bg-pink-500 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-600"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
}
