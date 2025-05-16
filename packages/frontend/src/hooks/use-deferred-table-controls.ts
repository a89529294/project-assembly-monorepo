import { useDeferredValue, useMemo } from "react";
import { OrderDirection, SortChangeResult } from "@/types/user-types";

interface DeferredTableControlsParams<T extends string = string> {
  page: number;
  pageSize: number;
  orderBy: T;
  orderDirection: OrderDirection;
  searchTerm?: string;
}

interface DeferredTableControlsReturn<T extends string = string> {
  deferredValues: {
    page: number;
    pageSize: number;
    orderBy: T;
    orderDirection: OrderDirection;
    searchTerm?: string;
  };
  isUpdatingTableData: boolean;
  handleSortChange: (
    columnId: T,
    currentOrderBy: T,
    currentOrderDirection: OrderDirection
  ) => SortChangeResult<T>;
}

/**
 * A custom hook for handling pagination and sorting logic
 * @param params - Pagination and sorting parameters
 * @returns Pagination and sorting state and handlers
 */
export function useDeferredTableControls<T extends string = string>({
  page,
  pageSize,
  orderBy,
  orderDirection,
  searchTerm,
}: DeferredTableControlsParams<T>): DeferredTableControlsReturn<T> {
  // Create deferred values for all parameters to improve UI responsiveness
  const deferredPage = useDeferredValue(page);
  const deferredPageSize = useDeferredValue(pageSize);
  const deferredOrderBy = useDeferredValue(orderBy);
  const deferredOrderDirection = useDeferredValue(orderDirection);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Determine if we're in a loading state based on deferred values
  const isUpdatingTableData = useMemo(
    () =>
      page !== deferredPage ||
      pageSize !== deferredPageSize ||
      orderBy !== deferredOrderBy ||
      orderDirection !== deferredOrderDirection ||
      searchTerm !== deferredSearchTerm,
    [
      page,
      deferredPage,
      pageSize,
      deferredPageSize,
      orderBy,
      deferredOrderBy,
      orderDirection,
      deferredOrderDirection,
      searchTerm,
      deferredSearchTerm,
    ]
  );

  // Handler for changing sort order
  const handleSortChange = useMemo(
    () =>
      (
        columnId: T,
        currentOrderBy: T,
        currentOrderDirection: OrderDirection
      ): SortChangeResult<T> => {
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

  return {
    deferredValues: {
      page: deferredPage,
      pageSize: deferredPageSize,
      orderBy: deferredOrderBy,
      orderDirection: deferredOrderDirection,
      searchTerm: deferredSearchTerm,
    },
    isUpdatingTableData,
    handleSortChange,
  };
}
