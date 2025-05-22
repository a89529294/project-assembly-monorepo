import { useDeferredValue, useMemo } from "react";
import { SortChangeResult } from "@/types/user-types";
import { OrderDirection } from "@myapp/shared";

export interface DeferredPaginatedTableControlsProps<
  T extends string = string,
> {
  page: number;
  pageSize: number;
  orderBy: T;
  orderDirection: OrderDirection;
  searchTerm: string;
}

export interface DeferredPaginatedTableControlsReturn<
  T extends string = string,
> {
  deferredValues: {
    page: number;
    pageSize: number;
    orderBy: T;
    orderDirection: OrderDirection;
    searchTerm: string;
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

export function useDeferredPaginatedTableControls<T extends string = string>({
  page,
  pageSize,
  orderBy,
  orderDirection,
  searchTerm,
}: DeferredPaginatedTableControlsProps<T>): DeferredPaginatedTableControlsReturn<T> {
  const deferredPage = useDeferredValue(page);
  const deferredPageSize = useDeferredValue(pageSize);
  const deferredOrderBy = useDeferredValue(orderBy);
  const deferredOrderDirection = useDeferredValue(orderDirection);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const isUpdatingTableData =
    page !== deferredPage ||
    pageSize !== deferredPageSize ||
    orderBy !== deferredOrderBy ||
    orderDirection !== deferredOrderDirection ||
    searchTerm !== deferredSearchTerm;

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
