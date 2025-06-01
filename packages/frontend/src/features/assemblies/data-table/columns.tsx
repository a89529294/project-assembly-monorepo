import { ProjectAssembly } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ProjectAssembly>();

export const genProjectAssemblyColumns = () =>
  [
    columnHelper.accessor("change", {
      header: "狀態",
    }),
    columnHelper.accessor("tagId", {
      header: "標籤 ID",
    }),
    columnHelper.accessor("name", {
      header: "組件名稱",
    }),
    columnHelper.accessor("type", {
      header: "類型",
    }),
    columnHelper.accessor("installPosition", {
      header: "安裝位置",
    }),
    columnHelper.accessor("installHeight", {
      header: "安裝高度",
      cell: (info) => info.getValue()?.toString() || "--",
    }),
    columnHelper.accessor("areaType", {
      header: "區域類型",
    }),
    columnHelper.accessor("specification", {
      header: "規格",
    }),
    columnHelper.accessor("material", {
      header: "材質",
    }),
    columnHelper.accessor("totalWeight", {
      header: "總重量",
      cell: (info) => info.getValue()?.toString() || "--",
    }),
    columnHelper.accessor("totalArea", {
      header: "總面積",
      cell: (info) => info.getValue()?.toString() || "--",
    }),
    columnHelper.accessor("createdAt", {
      header: "建立時間",
      cell: (info) => {
        const date = info.getValue();
        return date ? new Date(date).toLocaleDateString() : "--";
      },
    }),
  ] as ColumnDef<ProjectAssembly>[];
