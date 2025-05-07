"use client";

import { DepartmentSummary } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<DepartmentSummary>();

export const departmentColumns = [
  columnHelper.accessor("id", {
    header: "id",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("name", {
    header: "名稱",
    cell: (info) => info.getValue(),
  }),
] as ColumnDef<DepartmentSummary>[];
