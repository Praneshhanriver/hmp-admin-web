import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { FIRST_PAGE } from "@/constants/invitation";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Full version: every page number. Compact version: "Page 2 of 3" (small screens, Lesson 7)
export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + FIRST_PAGE);
  const isFirst = page === FIRST_PAGE;
  const isLast = page === totalPages;

  const previous = (
    <button type="button" className="pagination-step" disabled={isFirst} onClick={() => onPageChange(page - 1)}>
      <CaretLeft aria-hidden /> Previous
    </button>
  );
  const next = (
    <button type="button" className="pagination-step" disabled={isLast} onClick={() => onPageChange(page + 1)}>
      Next <CaretRight aria-hidden />
    </button>
  );

  return (
    <>
      <nav className="pagination pagination-full" aria-label="Pagination">
        {previous}
        {pages.map((number) => {
          const isCurrent = number === page;
          return (
            <button
              key={number}
              type="button"
              className={isCurrent ? "pagination-page is-current" : "pagination-page"}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={isCurrent ? `Page ${number}, current page` : `Page ${number}`}
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          );
        })}
        {next}
      </nav>

      <nav className="pagination pagination-compact" aria-label="Pagination">
        {previous}
        <span className="pagination-compact-label" aria-current="page">
          Page {page} of {totalPages}
        </span>
        {next}
      </nav>
    </>
  );
}
