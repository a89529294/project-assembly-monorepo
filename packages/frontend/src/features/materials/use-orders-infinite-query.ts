import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { MaterialSearchFilter } from "@/components/dialogs/material-search";

export type OrdersInfiniteQueryResult = ReturnType<
  typeof useOrdersInfiniteQuery
>;

export type OrdersColumns =
  OrdersInfiniteQueryResult["data"]["pages"][number]["items"][number];

export function useOrdersInfiniteQuery(filters: MaterialSearchFilter[]) {
  return useSuspenseInfiniteQuery(
    trpc.warehouse.readOrders.infiniteQueryOptions(
      { cursor: 0, filters },
      {
        initialCursor: 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );
}
