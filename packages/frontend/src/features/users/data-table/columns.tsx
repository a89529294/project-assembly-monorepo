import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { DialogNewPassword } from "@/components/dialogs/new-password";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderDirection, UserSummary, UserSummaryKey } from "@myapp/shared";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { SelectionState } from "@/hooks/use-global-selection";
import { flushSync } from "react-dom";

const columnHelper = createColumnHelper<UserSummary>();

export const genUserColumns = ({
  orderBy,
  orderDirection,
  clickOnCurrentHeader,
  clickOnOtherHeader,
  hideColumns,
  onSelectAllChange,
  selection,
  setDeselectedId,
  setReselectedId,
  totalFilteredCount,
}: {
  orderBy: UserSummaryKey;
  orderDirection: OrderDirection;
  clickOnCurrentHeader: (s: UserSummaryKey) => void;
  clickOnOtherHeader: (s: UserSummaryKey) => void;
  hideColumns?: string[];
  onSelectAllChange?: (checked: boolean) => void;
  selection: SelectionState;
  setDeselectedId?: (s: string) => void;
  setReselectedId?: (s: string) => void;
  totalFilteredCount?: number;
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
      id: "select",
      header: ({ table }) => {
        // Use the custom isAllSelected function if provided
        const checked = selection
          ? selection.selectAll === false
            ? false
            : selection.deselectedIds.size === 0
              ? true
              : selection.deselectedIds.size === totalFilteredCount
                ? false
                : "indeterminate"
          : table.getIsAllPageRowsSelected();

        return (
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => {
              if (onSelectAllChange) {
                // Use the custom select all handler if provided
                onSelectAllChange(!!value);
              } else {
                // Fall back to the default behavior
                table.toggleAllPageRowsSelected(!!value);
              }
            }}
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            if (value === false && setDeselectedId) {
              flushSync(() => setDeselectedId(row.original.id));
            }
            if (value === true && setReselectedId) {
              flushSync(() => setReselectedId(row.original.id));
            }

            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
        />
      ),
    }),
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
    // Other columns...
  ].filter((c) => show(c.id!)) as ColumnDef<UserSummary>[];
};
