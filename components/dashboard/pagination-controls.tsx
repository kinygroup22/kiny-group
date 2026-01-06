// components/dashboard/pagination-controls.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

export function PaginationControls({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationControlsProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages: (number | string)[] = [];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Always show first page
    pages.push(1);

    // Add ellipsis if there's a gap after first page
    if (rangeStart > 2) {
      pages.push("...");
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis if there's a gap before last page
    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-1">
        {/* First Page */}
        <Link
          href={buildUrl(1)}
          aria-disabled={currentPage === 1}
          className={currentPage === 1 ? "pointer-events-none" : ""}
        >
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
        </Link>

        {/* Previous Page */}
        <Link
          href={buildUrl(currentPage - 1)}
          aria-disabled={currentPage === 1}
          className={currentPage === 1 ? "pointer-events-none" : ""}
        >
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <Button key={`ellipsis-${index}`} variant="ghost" size="icon" disabled>
                ...
              </Button>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link key={pageNum} href={buildUrl(pageNum)}>
              <Button
                variant={isActive ? "default" : "outline"}
                size="icon"
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </Button>
            </Link>
          );
        })}

        {/* Next Page */}
        <Link
          href={buildUrl(currentPage + 1)}
          aria-disabled={currentPage === totalPages}
          className={currentPage === totalPages ? "pointer-events-none" : ""}
        >
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>

        {/* Last Page */}
        <Link
          href={buildUrl(totalPages)}
          aria-disabled={currentPage === totalPages}
          className={currentPage === totalPages ? "pointer-events-none" : ""}
        >
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}