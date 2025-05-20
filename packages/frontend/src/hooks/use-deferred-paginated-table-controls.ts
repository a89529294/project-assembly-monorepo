// import { useDeferredValue, useMemo } from "react";
// import { SortChangeResult } from "@/types/user-types";
// import { AppUserPermission, OrderDirection } from "@myapp/shared";

// // Base type with common properties
// interface BaseTableParams {
//   searchTerm: string;
//   type: string; // Discriminator field
// }

// // Paginated params type
// interface PaginatedTableParams<T extends string = string>
//   extends BaseTableParams {
//   type: "paginated";
//   page: number;
//   pageSize: number;
//   orderBy: T;
//   orderDirection: OrderDirection;
// }

// // Non-paginated params type
// interface NonPaginatedTableParams extends BaseTableParams {
//   type: "non-paginated";
//   permission: AppUserPermission;
// }

// // Combined discriminated union type
// type TableControlsParams<T extends string = string> =
//   | PaginatedTableParams<T>
//   | NonPaginatedTableParams;

// // Return value type with proper discrimination
// type DeferredValues<T extends string = string> =
//   | Omit<PaginatedTableParams<T>, "type">
//   | Omit<NonPaginatedTableParams, "type">;

// /**
//  * A custom hook for handling pagination and sorting logic
//  * @param params - Pagination and sorting parameters with discriminated union
//  * @returns Pagination and sorting state and handlers
//  */
// export function useDeferredTableControls<T extends string = string>(
//   props: TableControlsParams<T>
// ): {
//   deferredValues: DeferredValues<T>;
//   isUpdatingTableData: boolean;
//   handleSortChange: (
//     columnId: T,
//     currentOrderBy: T,
//     currentOrderDirection: OrderDirection
//   ) => SortChangeResult<T>;
// } {
//   const isPaginated = props.type === "paginated";

//   // Handle deferred values based on type
//   const deferredSearchTerm = useDeferredValue(props.searchTerm);

//   // Type-specific deferred values
//   const deferredPage = useDeferredValue(isPaginated ? props.page : 1);
//   const deferredPageSize = useDeferredValue(isPaginated ? props.pageSize : 1);
//   const deferredOrderBy = useDeferredValue(
//     isPaginated ? props.orderBy : ("" as T)
//   );
//   const deferredOrderDirection = useDeferredValue(
//     isPaginated ? props.orderDirection : ("DESC" as OrderDirection)
//   );
//   const deferredPermission = useDeferredValue(
//     !isPaginated ? props.permission : ("" as AppUserPermission)
//   );

//   // Determine if we're in a loading state based on deferred values
//   const isUpdatingTableData = (() => {
//     if (isPaginated) {
//       return (
//         props.page !== deferredPage ||
//         props.pageSize !== deferredPageSize ||
//         props.orderBy !== deferredOrderBy ||
//         props.orderDirection !== deferredOrderDirection ||
//         props.searchTerm !== deferredSearchTerm
//       );
//     } else {
//       return (
//         props.permission !== deferredPermission ||
//         props.searchTerm !== deferredSearchTerm
//       );
//     }
//   })();

//   // Handler for changing sort order
//   const handleSortChange = useMemo(
//     () =>
//       (
//         columnId: T,
//         currentOrderBy: T,
//         currentOrderDirection: OrderDirection
//       ): SortChangeResult<T> => {
//         if (columnId === currentOrderBy) {
//           // Toggle direction if clicking the same column
//           return {
//             orderBy: columnId,
//             orderDirection: currentOrderDirection === "DESC" ? "ASC" : "DESC",
//             page: 1, // Reset to first page on sort change
//           };
//         } else {
//           // Default to DESC for new column
//           return {
//             orderBy: columnId,
//             orderDirection: "DESC",
//             page: 1, // Reset to first page on sort change
//           };
//         }
//       },
//     []
//   );

//   return {
//     deferredValues: isPaginated
//       ? {
//           page: deferredPage,
//           pageSize: deferredPageSize,
//           orderBy: deferredOrderBy,
//           orderDirection: deferredOrderDirection,
//           searchTerm: deferredSearchTerm,
//         }
//       : {
//           searchTerm: deferredSearchTerm,
//           permission: deferredPermission,
//         },
//     isUpdatingTableData,
//     handleSortChange,
//   };
// }

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
