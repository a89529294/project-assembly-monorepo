import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { MaterialSearchFilter } from "@/components/dialogs/material-search";

export type PurchasesInfiniteQueryResult = ReturnType<
  typeof usePurchasesInfiniteQuery
>;

export type PurchasesColumns =
  PurchasesInfiniteQueryResult["data"]["pages"][number]["items"][number];

export function usePurchasesInfiniteQuery(filters: MaterialSearchFilter[]) {
  return useSuspenseInfiniteQuery(
    trpc.warehouse.readPurchases.infiniteQueryOptions(
      { cursor: 0, filters },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );
}
