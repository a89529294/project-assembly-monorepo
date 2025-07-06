import { MaterialDetailDialog } from "@/components/dialogs/material-detail-dialog";
import { MaterialCuttingDialog } from "@/components/dialogs/material-cutting-dialog";
import { PurchasesColumns } from "@/features/materials/use-purchases-infinite-query";
import { Material } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { trpc } from "@/trpc";
import { baseMaterialColumns } from "@/features/materials/common-columns";

const columnHelper = createColumnHelper<PurchasesColumns>();

export const purchasesColumns = [
  ...baseMaterialColumns,
  columnHelper.accessor("arrivalDate", {
    header: "進貨日期",
    id: "arrivalDate",
    cell: (info) => {
      const date = info.getValue();
      return date ? format(date, "yyyy/MM/dd") : "";
    },
  }),
  columnHelper.accessor("arrivalConfirmedEmployee.chName", {
    header: "進貨人員",
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <MaterialDetailDialog
          queryKeyToInvalidate={trpc.warehouse.readPurchases.infiniteQueryKey()}
          material={row.original}
        />
        {row.original.isCuttable && (
          <MaterialCuttingDialog material={row.original} />
        )}
      </div>
    ),
  }),
] as ColumnDef<Material>[];
