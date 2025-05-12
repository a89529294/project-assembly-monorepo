import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  EmployeeSummary,
  EmployeeSummaryKey,
  OrderDirection,
} from "@myapp/shared";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectionState } from "@/hooks/use-selection";

const columnHelper = createColumnHelper<EmployeeSummary>();

export const genEmployeeColumns = ({
  orderBy,
  orderDirection,
  clickOnCurrentHeader,
  clickOnOtherHeader,
  hiddenColumns,
  onSelectAllChange,
  selection,
}: {
  orderBy: EmployeeSummaryKey;
  orderDirection: OrderDirection;
  clickOnCurrentHeader: (s: EmployeeSummaryKey) => void;
  clickOnOtherHeader: (s: EmployeeSummaryKey) => void;
  hiddenColumns?: string[];
  onSelectAllChange: (checked: boolean) => void;
  selection: SelectionState;
}) => {
  const genHeader = (columnId: EmployeeSummaryKey, headerText: string) => {
    return (
      <Button
        variant="ghost"
        onClick={() => {
          if (orderBy === columnId) {
            clickOnCurrentHeader(columnId);
          } else {
            clickOnOtherHeader(columnId);
          }
        }}
        className="has-[>svg]:px-0"
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
    columnHelper.display({
      id: "select",
      header: ({ table }) => {
        const checked = selection
          ? selection.selectAll === false
            ? false
            : selection.deselectedIds.size === 0
              ? true
              : "indeterminate"
          : table.getIsAllPageRowsSelected();

        return (
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => {
              onSelectAllChange(!!value);
            }}
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
        />
      ),
    }),
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
    columnHelper.accessor("maritalStatus", {
      header: "婚姻狀態",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("education", {
      header: "學歷",
      cell: (info) => info.getValue() || "-",
    }),
    ...(hiddenColumns?.includes("employee-detail-link")
      ? []
      : [
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
        ]),
  ] as ColumnDef<EmployeeSummary>[];
};
