import { MaterialDetailDialog } from "@/components/dialogs/material-detail-dialog";
import { baseMaterialColumns } from "@/features/materials/common-columns";
import { OrdersColumns } from "@/features/materials/use-orders-infinite-query";
import { trpc } from "@/trpc";
import { Material } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<OrdersColumns>();

export const ordersColumns = [
  ...baseMaterialColumns,
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <MaterialDetailDialog
          queryKeyToInvalidate={trpc.warehouse.readOrders.infiniteQueryKey()}
          material={row.original}
        />
      </div>
    ),
  }),
] as ColumnDef<Material>[];
