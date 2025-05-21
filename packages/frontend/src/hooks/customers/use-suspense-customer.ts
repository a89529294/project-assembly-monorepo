import { trpc } from "@/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSuspenseCustomer(customerId: string) {
  return useSuspenseQuery(trpc.basicInfo.readCustomer.queryOptions(customerId));
}
