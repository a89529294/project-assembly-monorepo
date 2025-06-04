import { RevealOnHover } from "@/components/data-table/hoverable-action-cell";
import { SortableTableHeader } from "@/components/data-table/sortable-table-header";
import { DialogDeleteCustomer } from "@/components/dialogs/delete-customer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectionState } from "@/hooks/use-selection";
import {
  CustomerSummary,
  CustomerSummaryKey,
  OrderDirection,
} from "@myapp/shared";
import { Link } from "@tanstack/react-router";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  LucideReceiptText,
} from "lucide-react";

const columnHelper = createColumnHelper<CustomerSummary>();

export const genCustomerColumns = ({
  orderBy,
  orderDirection,
  clickOnCurrentHeader,
  clickOnOtherHeader,
  onSelectAllChange,
  selection,
}: {
  orderBy: CustomerSummaryKey;
  orderDirection: OrderDirection;
  clickOnCurrentHeader: (s: CustomerSummaryKey) => void;
  clickOnOtherHeader: (s: CustomerSummaryKey) => void;
  onSelectAllChange: (checked: boolean) => void;
  selection: SelectionState;
}) => {
  const genHeader = (columnId: CustomerSummaryKey, headerText: string) => {
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
    columnHelper.accessor("customerNumber", {
      header: () => (
        <SortableTableHeader
          columnId="customerNumber"
          headerText="客戶編號"
          currentSortColumn={orderBy}
          sortDirection={orderDirection}
          onSort={(columnId) => {
            if (orderBy === columnId) {
              clickOnCurrentHeader(columnId);
            } else {
              clickOnOtherHeader(columnId);
            }
          }}
        />
      ),
    }),
    columnHelper.accessor("name", {
      header: () => genHeader("name", "名稱"),
    }),
    columnHelper.accessor("nickname", {
      header: () => genHeader("nickname", "簡稱"),
    }),
    columnHelper.accessor("category", {
      header: () => genHeader("category", "類別"),
    }),
    columnHelper.accessor("principal", {
      header: () => genHeader("principal", "負責人"),
    }),
    columnHelper.accessor("taxDeductionCategory", {
      header: () => genHeader("taxDeductionCategory", "扣稅類別"),
    }),
    columnHelper.accessor("taxId", {
      header: () => genHeader("taxId", "統一編號"),
    }),
    columnHelper.accessor("phone", {
      header: () => genHeader("phone", "電話"),
    }),
    columnHelper.display({
      id: "delete-customer",
      size: 32,
      header() {
        return "";
      },
      cell(info) {
        return <DialogDeleteCustomer customer={info.row.original} />;
      },
    }),
    columnHelper.display({
      id: "view-customer",
      cell: ({ row }) => {
        const customer = row.original;

        return (
          <RevealOnHover className="pr-4">
            <Link
              to="/customers/summary/$customerId"
              params={{ customerId: customer.id }}
              search={{ mode: "read" }}
            >
              <LucideReceiptText className="size-4" />
            </Link>
          </RevealOnHover>
        );
      },
      size: 48,
    }),
  ] as ColumnDef<CustomerSummary>[];
};
