import { DataTable } from "@/components/data-table";
import { SmartPagination } from "@/components/pagination";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSummaryPageContext } from "@/contexts/summary-page-context";
import { cn } from "@/lib/utils";

export function SummaryPageDataTable<
  T extends { id: string },
  U extends string & keyof T,
>() {
  const {
    search,
    disableInputs,
    totalPages,
    handlePageChange,
    columns,
    data,
    rowSelection,
    handleSelectionChange,
  } = useSummaryPageContext<T, U>();

  return (
    <div className="flex-1 relative">
      <div className="absolute inset-0 bottom-10">
        <ScrollArea
          className={cn(
            "rounded-md border p-0 h-full",
            disableInputs && "opacity-50"
          )}
        >
          <DataTable
            columns={columns}
            data={data}
            rowSelection={rowSelection}
            setRowSelection={handleSelectionChange}
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <SmartPagination
        className="absolute bottom-0 h-10 flex items-center"
        totalPages={totalPages}
        currentPage={search.page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
