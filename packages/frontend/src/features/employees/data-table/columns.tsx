import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";
import { EmployeeSummary } from "@myapp/shared";

const columnHelper = createColumnHelper<EmployeeSummary>();

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
  columnHelper.accessor("phone", {
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
  columnHelper.display({
    id: "employee-detail-link",
    cell: (props) => (
      <Link
        to="/basic-info/employees/$employeeId"
        params={{ employeeId: props.row.original.id }}
      >
        員工細節
      </Link>
    ),
  }),
] as ColumnDef<EmployeeSummary>[];
