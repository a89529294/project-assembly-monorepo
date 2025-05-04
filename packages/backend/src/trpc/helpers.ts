import { OrderDirection } from "@myapp/shared";
import { asc, desc } from "drizzle-orm";

export function orderDirectionFn(orderDirection: OrderDirection | undefined) {
  return orderDirection
    ? {
        ASC: asc,
        DESC: desc,
      }[orderDirection]
    : desc;
}
