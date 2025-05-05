import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { OrderDirection, UserSummary, UserSummaryKey } from "@myapp/shared";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

const columnHelper = createColumnHelper<UserSummary>();

export const genUserColumns = ({
  orderBy,
  orderDirection,
  clickOnCurrentHeader,
  clickOnOtherHeader,
}: {
  orderBy: UserSummaryKey;
  orderDirection: OrderDirection;
  clickOnCurrentHeader: (s: UserSummaryKey) => void;
  clickOnOtherHeader: (s: UserSummaryKey) => void;
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
  ] as ColumnDef<UserSummary>[];
};
