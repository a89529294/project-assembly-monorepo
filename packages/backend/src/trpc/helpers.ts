import { OrderDirection } from "@myapp/shared";
import { asc, desc } from "drizzle-orm";
import { z } from "zod";

export function orderDirectionFn(orderDirection: OrderDirection | undefined) {
  return orderDirection
    ? {
        ASC: asc,
        DESC: desc,
      }[orderDirection]
    : desc;
}

export const selectionInputSchema = z.union([
  z.object({ selectedIds: z.array(z.string().min(1)).min(1) }),
  z.object({
    searchTerm: z.string(),
    deSelectedIds: z.array(z.string()),
  }),
]);
