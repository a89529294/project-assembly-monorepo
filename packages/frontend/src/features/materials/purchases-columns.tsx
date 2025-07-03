import { MaterialDetailDialog } from "@/components/dialogs/material-detail-dialog";
import { MaterialCuttingDialog } from "@/components/dialogs/material-cutting-dialog";
import { PurchasesColumns } from "@/features/materials/use-purchases-infinite-query";
import { Material } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { trpc } from "@/trpc";

const columnHelper = createColumnHelper<PurchasesColumns>();

export const purchasesColumns = [
  columnHelper.accessor("supplier", {
    header: "供應商",
    id: "supplier",
  }),
  columnHelper.accessor("millSheetNo", {
    header: "材質證明",
    id: "millSheetNo",
  }),
  columnHelper.accessor("millSheetNo", {
    header: "無輻射",
    id: "millSheetNoNR",
  }),
  columnHelper.accessor("millSheetNo", {
    header: "超音波",
    id: "millSheetNoU",
  }),
  columnHelper.accessor("labelId", { header: "素材ID", id: "labelId" }),
  columnHelper.accessor("typeName", { header: "素材型號", id: "typeName" }),
  columnHelper.accessor("material", { header: "材質", id: "material" }),
  columnHelper.accessor("specification", {
    header: "斷面規格",
    id: "specification",
  }),
  columnHelper.accessor("length", { header: "長度", id: "length" }),
  columnHelper.accessor("weight", { header: "重量", id: "weight" }),
  columnHelper.accessor("procurementNumber", {
    header: "採購案號",
    id: "procurementNumber",
  }),
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
  columnHelper.accessor("status", { header: "狀態", id: "status" }),
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
