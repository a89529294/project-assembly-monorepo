import { ScrollArea } from "@/components/ui/scroll-area";
import { SmartPagination } from "@/components/pagination";
import { SearchBar, SearchBarImperativeHandle } from "@/components/search-bar";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dispatch, ReactNode, Ref, SetStateAction } from "react";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";

interface DataTableLayoutProps<TData, TValue> {
  title: string;
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: Dispatch<SetStateAction<RowSelectionState>>;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSearchChange: (searchTerm: string) => void;
  initialSearchTerm?: string;
  isUpdating?: boolean;
  selectedCount?: number;
  disableInputs?: boolean;
  onDelete?: () => void;
  deleteButtonText?: string;
  addButtonLink?: string;
  addButtonText?: string;
  searchBarRef?: Ref<SearchBarImperativeHandle>;
  selectionCountText?: string;
  rightSideActions?: ReactNode;
}

export function SummaryPageUI<TData extends { id: string }, TValue>({
  title,
  data,
  columns,
  rowSelection,
  onRowSelectionChange,
  totalPages,
  currentPage,
  onPageChange,
  onSearchChange,
  initialSearchTerm = "",
  isUpdating = false,
  selectedCount = 0,
  disableInputs = false,
  onDelete,
  deleteButtonText = "Delete",
  addButtonLink,
  addButtonText = "Add New",
  searchBarRef,
  selectionCountText = "Selected",
  rightSideActions,
}: DataTableLayoutProps<TData, TValue>) {
  return (
    <div className="p-6 pb-0 bg-white flex flex-col rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          {title}
          <SearchBar
            ref={searchBarRef}
            onSearchChange={onSearchChange}
            initSearchTerm={initialSearchTerm}
            disabled={disableInputs}
            isUpdating={isUpdating}
          />
        </div>
        <div className="flex items-center gap-3">
          {selectedCount > 0 && onDelete && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal">
                {selectedCount} {selectionCountText}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={disableInputs}
              >
                {deleteButtonText}
              </Button>
            </div>
          )}
          {rightSideActions}
          {addButtonLink && (
            <Button asChild disabled={disableInputs}>
              <a href={addButtonLink}>{addButtonText}</a>
            </Button>
          )}
        </div>
      </h2>
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
              setRowSelection={onRowSelectionChange}
            />
          </ScrollArea>
        </div>
        <SmartPagination
          className="absolute bottom-0 h-10 flex items-center"
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
