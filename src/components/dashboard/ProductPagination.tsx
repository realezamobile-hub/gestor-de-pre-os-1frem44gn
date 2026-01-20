import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useProductStore } from '@/stores/useProductStore'
import { useIsMobile } from '@/hooks/use-mobile'

export function ProductPagination() {
  const { page, pageSize, total, setPage, isLoading } = useProductStore()
  const isMobile = useIsMobile()

  // Ensure total is valid
  if (total === 0 && !isLoading) return null

  // page is 0-indexed in store, but we display 1-indexed
  const currentPage = page + 1
  const totalPages = Math.ceil(total / pageSize)

  // Calculations for range display
  const startItem = page * pageSize + 1
  const endItem = Math.min((page + 1) * pageSize, total)

  // Helper to generate page numbers
  const getPageNumbers = () => {
    const delta = isMobile ? 1 : 2 // Number of pages to show around current
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  const pages = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Mostrando{' '}
        <span className="font-medium">{total > 0 ? startItem : 0}</span>-
        <span className="font-medium">{endItem}</span> de{' '}
        <span className="font-medium">{total}</span> produtos
      </div>

      <div className="order-1 sm:order-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(page - 1)}
                className={
                  page === 0 || isLoading
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {pages.map((p, i) => (
              <PaginationItem key={i}>
                {p === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={p === currentPage}
                    onClick={() => setPage((p as number) - 1)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(page + 1)}
                className={
                  currentPage >= totalPages || isLoading
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
