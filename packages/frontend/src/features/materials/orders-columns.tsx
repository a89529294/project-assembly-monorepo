import { MaterialDetailDialog } from "@/components/dialogs/material-detail-dialog";
import { OrdersColumns } from "@/features/materials/use-orders-infinite-query";
import { trpc } from "@/trpc";
import { Material } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<OrdersColumns>();

export const ordersColumns = [
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
  columnHelper.accessor("status", { header: "狀態", id: "status" }),
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
