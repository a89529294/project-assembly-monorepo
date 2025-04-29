import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Employee } from "../../../../../backend/src/trpc/router";

const columnHelper = createColumnHelper<Employee>();

export const employeeColumns = [
  columnHelper.accessor("idNumber", {
    header: "員工編號",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("chName", {
    header: "中文姓名",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("enName", {
    header: "英文姓名",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("gender", {
    header: "性別",
    cell: (info) =>
      info.getValue() === "male"
        ? "男"
        : info.getValue() === "female"
          ? "女"
          : "-",
  }),
  columnHelper.accessor("birthday", {
    header: "生日",
    cell: (info) => info.getValue()?.toLocaleDateString() || "-",
  }),
  columnHelper.accessor("phone1", {
    header: "電話",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "電子信箱",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("marital_status", {
    header: "婚姻狀態",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("education", {
    header: "學歷",
    cell: (info) => info.getValue() || "-",
  }),
] as ColumnDef<Employee>[];
