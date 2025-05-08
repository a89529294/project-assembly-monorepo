import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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

interface DataTableProps<TData extends Record<"id", string>, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowSelect?: (id: string) => void;
  selectedRows?: string[];
}

//Tip: If you find yourself using <DataTable /> in multiple places, this is the component you could make reusable by extracting it to components/ui/data-table.tsx.

//<DataTable columns={columns} data={data} />;

export function DataTable<TData extends Record<"id", string>, TValue>({
  columns,
  data,
  onRowSelect,
  selectedRows,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
                console.log(header.getSize());
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
                onClick={() => {
                  if (onRowSelect) onRowSelect(row.original.id);
                }}
                className={cn(
                  selectedRows?.includes(row.original.id) &&
                    "outline-2 outline-blue-300"
                )}
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
