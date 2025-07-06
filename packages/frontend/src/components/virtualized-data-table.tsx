import {
  Cell,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VirtualizedDataTableProps<
  TData extends Record<"id", string>,
  TValue,
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fetchNextPage: () => void;
  isFetching: boolean;
  totalDBRowCount: number;
  totalFetched: number;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
}

export function VirtualizedDataTable<
  TData extends Record<"id", string>,
  TValue,
>({
  columns,
  data,
  fetchNextPage,
  isFetching,
  totalDBRowCount,
  totalFetched,
  rowSelection,
  setRowSelection,
}: VirtualizedDataTableProps<TData, TValue>) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const { rows } = table.getRowModel();

  const fetchMoreOnBottomReached = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < 200 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 33,
    getScrollElement: () => tableContainerRef.current,
    overscan: 10,
  });

  function MyCell({ cell }: { cell: Cell<TData, unknown> }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [showToolTip, setShowToolTip] = useState(false);

    useEffect(() => {
      if (ref.current && ref.current.scrollWidth > ref.current.clientWidth)
        setShowToolTip(true);
    }, []);

    return (
      <TableCell
        key={cell.id}
        className="flex items-center"
        style={{
          width: cell.column.getSize(),
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <span ref={ref} className="block truncate w-full">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
          </TooltipTrigger>
          {showToolTip && (
            <TooltipContent>
              <p>{String(cell.getValue())}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TableCell>
    );
  }

  return (
    <div
      className="h-full overflow-auto relative"
      onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
      ref={tableContainerRef}
    >
      <Table className="grid">
        <TableHeader className="grid sticky top-0 z-10 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="flex w-full"
              data-state={undefined} // prevent hover on header
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="flex items-center bg-background"
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody
          style={{
            display: "grid",
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<TData>;
            return (
              <TableRow
                data-index={virtualRow.index}
                ref={(node) => rowVirtualizer.measureElement(node)}
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className="flex w-full"
                style={{
                  position: "absolute",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  return <MyCell key={cell.id} cell={cell} />;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
