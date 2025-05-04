import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Link, UseNavigateResult } from "@tanstack/react-router";
import {
  EmployeeSummaryKey,
  EmployeeSummary,
  OrderDirection,
} from "@myapp/shared";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

const columnHelper = createColumnHelper<EmployeeSummary>();

export const genEmployeeColumns = (
  navigate: UseNavigateResult<"/basic-info/employees">,
  orderBy: EmployeeSummaryKey,
  orderDirection: OrderDirection
) => {
  const genHeader = (columnId: EmployeeSummaryKey, headerText: string) => {
    return (
      <Button
        variant="ghost"
        onClick={() => {
          if (orderBy !== columnId)
            navigate({
              search: {
                page: 1,
                orderBy: columnId,
                orderDirection: "DESC",
              },
            });
          else {
            navigate({
              search: {
                page: 1,
                orderBy: columnId,
                orderDirection: orderDirection === "DESC" ? "ASC" : "DESC",
              },
            });
          }
        }}
      >
        {headerText}
        {orderBy === columnId ? (
          orderDirection === "DESC" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUp className="ml-2 h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    );
  };

  return [
    columnHelper.accessor("idNumber", {
      header: () => genHeader("idNumber", "員工編號"),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("chName", {
      header: () => genHeader("chName", "中文姓名"),
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
};
