import { useDeferredValue, useMemo } from "react";
import { OrderDirection, PageChangeResult, SortChangeResult } from "@/types/user-types";

interface PaginationSortingParams<T extends string = string> {
  page: number;
  pageSize: number;
  orderBy: T;
  orderDirection: OrderDirection;
  searchTerm?: string;
}

interface PaginationSortingHookReturn<T extends string = string> extends PaginationSortingParams<T> {
  deferredPage: number;
  deferredOrderBy: T;
  deferredOrderDirection: OrderDirection;
  deferredSearchTerm?: string;
  isLoading: boolean;
  handleSortChange: (columnId: T, currentOrderBy: T, currentOrderDirection: OrderDirection) => SortChangeResult<T>;
  handlePageChange: (newPage: number) => PageChangeResult;
}

/**
 * A custom hook for handling pagination and sorting logic
 * @param params - Pagination and sorting parameters
 * @returns Pagination and sorting state and handlers
 */
export function usePaginationSorting<T extends string = string>({
  page,
  pageSize,
  orderBy,
  orderDirection,
  searchTerm,
}: PaginationSortingParams<T>): PaginationSortingHookReturn<T> {
  // Create deferred values for all parameters to improve UI responsiveness
  const deferredPage = useDeferredValue(page);
  const deferredOrderBy = useDeferredValue(orderBy);
  const deferredOrderDirection = useDeferredValue(orderDirection);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Determine if we're in a loading state based on deferred values
  const isLoading = useMemo(
    () =>
      page !== deferredPage ||
      orderBy !== deferredOrderBy ||
      orderDirection !== deferredOrderDirection ||
      searchTerm !== deferredSearchTerm,
    [
      page, deferredPage,
      orderBy, deferredOrderBy,
      orderDirection, deferredOrderDirection,
      searchTerm, deferredSearchTerm
    ]
  );

  // Handler for changing sort order
  const handleSortChange = useMemo(
    () => (columnId: T, currentOrderBy: T, currentOrderDirection: OrderDirection): SortChangeResult<T> => {
      if (columnId === currentOrderBy) {
        // Toggle direction if clicking the same column
        return {
          orderBy: columnId,
          orderDirection: currentOrderDirection === "DESC" ? "ASC" : "DESC",
          page: 1, // Reset to first page on sort change
        };
      } else {
        // Default to DESC for new column
        return {
          orderBy: columnId,
          orderDirection: "DESC",
          page: 1, // Reset to first page on sort change
        };
      }
    },
    []
  );

  // Handler for changing page
  const handlePageChange = useMemo(
    () => (newPage: number): PageChangeResult => ({
      page: newPage,
    }),
    []
  );

  return {
    page,
    pageSize,
    orderBy,
    orderDirection,
    searchTerm,
    deferredPage,
    deferredOrderBy,
    deferredOrderDirection,
    deferredSearchTerm,
    isLoading,
    handleSortChange,
    handlePageChange,
  };
}
