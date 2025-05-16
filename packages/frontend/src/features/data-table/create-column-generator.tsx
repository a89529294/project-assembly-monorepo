import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { OrderDirection } from "@myapp/shared";
import { SelectionState } from "@/hooks/use-selection";
import { SelectionHeaderCell } from "@/components/data-table/selectable-header-cell";
import { SelectionRowCell } from "@/components/data-table/selectable-row-cell";
import { SortableTableHeader } from "@/components/data-table/sortable-table-header";

type SortableDataType = Record<"id", string>;

export function createColumnGenerator<
  TData extends SortableDataType,
  TKey extends keyof TData & string,
>() {
  const columnHelper = createColumnHelper<TData>();

  return function generateColumns({
    orderBy,
    orderDirection,
    clickOnCurrentHeader,
    clickOnOtherHeader,
    onSelectAllChange,
    selection,
    columnDefinitions,
    additionalColumns = [],
  }: {
    orderBy: TKey;
    orderDirection: OrderDirection;
    clickOnCurrentHeader: (columnId: TKey) => void;
    clickOnOtherHeader: (columnId: TKey) => void;
    onSelectAllChange: (checked: boolean) => void;
    selection: SelectionState;
    columnDefinitions: Array<{
      key: TKey;
      header: string;
      cellRenderer?: (value: TData[TKey] | unknown) => React.ReactNode;
    }>;
    additionalColumns?: ColumnDef<TData>[];
  }) {
    const columns: ColumnDef<TData>[] = [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <SelectionHeaderCell
            selection={selection}
            onSelectAllChange={onSelectAllChange}
            tableGetIsAllPageRowsSelected={table.getIsAllPageRowsSelected}
          />
        ),
        cell: ({ row }) => (
          <SelectionRowCell
            isSelected={row.getIsSelected()}
            toggleSelected={(value) => row.toggleSelected(value)}
          />
        ),
      }),
      ...columnDefinitions.map((def) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columnHelper.accessor(def.key as any, {
          header: () => (
            <SortableTableHeader
              columnId={def.key}
              headerText={def.header}
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
          cell: def.cellRenderer
            ? ({ getValue }) => def.cellRenderer!(getValue())
            : ({ getValue }) => getValue() || "-",
        })
      ),
      ...additionalColumns,
    ];

    return columns;
  };
}
