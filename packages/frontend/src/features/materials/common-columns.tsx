import { Material } from "@myapp/shared";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Material>();

export const baseMaterialColumns = [
  columnHelper.accessor("supplier", {
    header: "供應商",
    size: 70,
  }),
  columnHelper.accessor("millSheetNo", {
    header: "材質證明",
  }),
  columnHelper.accessor("millSheetNo", {
    header: "無輻射",
    id: "millSheetNoNR",
  }),
  columnHelper.accessor("millSheetNo", {
    header: "超音波",
    id: "millSheetNoU",
  }),
  columnHelper.accessor("labelId", {
    header: "素材ID",
    size: 200,
  }),
  columnHelper.accessor("typeName", {
    header: "素材型號",
  }),
  columnHelper.accessor("material", {
    header: "材質",
  }),
  columnHelper.accessor("specification", {
    header: "斷面規格",
  }),
  columnHelper.accessor("length", {
    header: "長度",
    size: 100,
  }),
  columnHelper.accessor("weight", {
    header: "重量",
    size: 100,
  }),
  columnHelper.accessor("procurementNumber", {
    header: "採購案號",
  }),
  columnHelper.accessor("status", {
    header: "狀態",
  }),
];
