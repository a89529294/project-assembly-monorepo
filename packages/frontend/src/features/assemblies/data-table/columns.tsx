import { ProjectAssembly } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ProjectAssembly>();

export const genProjectAssemblyColumns = () =>
  [
    // 1. Status/identification
    columnHelper.accessor("change", { header: "狀態" }),
    columnHelper.accessor("tagId", { header: "鋼印ID" }),
    columnHelper.accessor("assemblyId", { header: "廣達構件GUID" }),
    columnHelper.accessor("name", { header: "構件編號" }),
    columnHelper.accessor("type", { header: "類型" }),
    columnHelper.accessor("installPosition", { header: "安裝位置" }),
    columnHelper.accessor("installHeight", {
      header: "安裝高程",
      cell: (info) => info.getValue()?.toString() || "--",
    }),

    // 2. Dimensions
    columnHelper.accessor("totalWidth", {
      header: "總寬度",
      cell: (info) => info.getValue()?.toString() || "--",
    }),
    columnHelper.accessor("totalHeight", {
      header: "總高度",
      cell: (info) => info.getValue()?.toString() || "--",
    }),
    columnHelper.accessor("totalLength", {
      header: "總長度",
      cell: (info) => info.getValue()?.toString() || "--",
    }),
    columnHelper.accessor("totalWeight", {
      header: "總重量",
      cell: (info) => info.getValue()?.toString() || "--",
    }),
    columnHelper.accessor("totalArea", {
      header: "總面積",
      cell: (info) => info.getValue()?.toString() || "--",
    }),

    // 3. Specification/material/drawing
    columnHelper.accessor("specification", { header: "斷面規格" }),
    columnHelper.accessor("material", { header: "材質" }),
    columnHelper.accessor("drawingName", { header: "圖紙名稱" }),

    // 4. Transport/shipping
    columnHelper.accessor("transportNumber", { header: "車次號碼" }),
    // columnHelper.accessor("shippingNumber", { header: "出貨編號" }),
    // columnHelper.accessor("shippingDate", {
    //   header: "出貨日期",
    //   cell: (info) => {
    //     const date = info.getValue();
    //     return date ? new Date(date).toLocaleDateString() : "--";
    //   },
    // }),

    // 5. Notes
    columnHelper.accessor("memo1", { header: "備註 1" }),
    columnHelper.accessor("memo2", { header: "備註 2" }),

    // 7. Created time
    columnHelper.accessor("createdAt", {
      header: "建立時間",
      cell: (info) => {
        const date = info.getValue();
        return date ? new Date(date).toLocaleDateString() : "--";
      },
    }),
    columnHelper.accessor("updatedAt", {
      header: "修改時間",
      cell: (info) => {
        const date = info.getValue();
        return date ? new Date(date).toLocaleDateString() : "--";
      },
    }),
  ] as ColumnDef<ProjectAssembly>[];
