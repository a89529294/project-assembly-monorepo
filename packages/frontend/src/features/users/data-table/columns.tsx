import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { OrderDirection, UserSummary, UserSummaryKey } from "@myapp/shared";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { DialogNewPassword } from "@/components/dialogs/new-password";

const columnHelper = createColumnHelper<UserSummary>();

export const genUserColumns = ({
  orderBy,
  orderDirection,
  clickOnCurrentHeader,
  clickOnOtherHeader,
  hideColumns,
}: {
  orderBy: UserSummaryKey;
  orderDirection: OrderDirection;
  clickOnCurrentHeader: (s: UserSummaryKey) => void;
  clickOnOtherHeader: (s: UserSummaryKey) => void;
  hideColumns?: string[];
}) => {
  const genHeader = (columnId: UserSummaryKey, headerText: string) => {
    return (
      <Button
        variant="ghost"
        onClick={() => {
          if (orderBy !== columnId) clickOnOtherHeader(columnId);
          else {
            clickOnCurrentHeader(columnId);
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

  const show = (colId: string) => !hideColumns?.includes(colId);

  return [
    columnHelper.display({
      id: "password",
      header: () => "密碼",
      size: 66,
      cell: (info) => (
        <div className="flex items-center">
          <DialogNewPassword userId={info.row.original.id} />
        </div>
      ),
    }),
    columnHelper.accessor("account", {
      header: () => genHeader("account", "員工編號"),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: () => genHeader("name", "中文姓名"),
      cell: (info) => info.getValue(),
    }),

    // columnHelper.display({
    //   id: "employee-detail-link",
    //   cell: (props) => (
    //     <Link
    //       to="/basic-info/employees/$employeeId"
    //       params={{ employeeId: props.row.original.id }}
    //     >
    //       員工細節
    //     </Link>
    //   ),
    // }),
  ].filter((c) => show(c.id!)) as ColumnDef<UserSummary>[];
};
