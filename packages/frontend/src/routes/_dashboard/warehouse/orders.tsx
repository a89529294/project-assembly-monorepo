import { createFileRoute } from "@tanstack/react-router";
import { PendingComponent } from "@/components/pending-component";
import { z } from "zod";
import { useOrdersInfiniteQuery } from "@/features/materials/use-orders-infinite-query";
import { MaterialTransactionPage } from "@/features/materials/components/material-transaction-page";
import { keyOfMaterialSchema } from "@myapp/shared";
import { ordersColumns } from "@/features/materials/orders-columns";

export const Route = createFileRoute("/_dashboard/warehouse/orders")({
  validateSearch: z.object({
    filters: z
      .array(
        z.object({
          field: keyOfMaterialSchema,
          value: z.string(),
        })
      )
      .optional()
      .default([]),
  }),
  pendingComponent: PendingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { filters } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <MaterialTransactionPage
      title="待進貨明細"
      filters={filters}
      useInfiniteQuery={useOrdersInfiniteQuery}
      navigate={navigate}
      columns={ordersColumns}
    />
  );
}
