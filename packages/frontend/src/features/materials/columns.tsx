import { MaterialCreateDialog } from "@/components/dialogs/material-create-dialog";
import { Material } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";

const columnHelper = createColumnHelper<Material>();

export const materialColumns = [
  columnHelper.accessor("supplier", {
    header: "供應商",
    id: "supplier",
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
  columnHelper.accessor("status", { header: "狀態", id: "status" }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => <MaterialCreateDialog material={row.original} />,
  }),
] as ColumnDef<Material>[];
