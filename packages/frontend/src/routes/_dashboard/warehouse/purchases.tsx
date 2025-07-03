import { PendingComponent } from "@/components/pending-component";
import { MaterialTransactionPage } from "@/features/materials/components/material-transaction-page";
import { keyOfMaterialSchema } from "@myapp/shared";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_dashboard/warehouse/purchases")({
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
      filters={filters}
      navigate={navigate}
      variant="purchases"
    />
  );
}
