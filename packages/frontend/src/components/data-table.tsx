import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

interface DataTableProps<TData extends Record<"id", string>, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowSelection?: RowSelectionState;
  setRowSelection?: Dispatch<SetStateAction<RowSelectionState>>;
}

//Tip: If you find yourself using <DataTable /> in multiple places, this is the component you could make reusable by extracting it to components/ui/data-table.tsx.

//<DataTable columns={columns} data={data} />;

export function DataTable<TData extends Record<"id", string>, TValue>({
  columns,
  data,
  rowSelection,
  setRowSelection,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <div className="">
      <Table
      //outerDivClassName="overflow-visible"
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="border-b-0" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn("bg-white")}
                    style={{
                      width:
                        header.column.getSize() !== 150
                          ? header.column.getSize()
                          : "auto",
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
