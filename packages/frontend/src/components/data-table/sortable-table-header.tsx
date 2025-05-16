import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortableTableHeaderProps<T extends string> {
  columnId: T;
  headerText: string;
  currentSortColumn: T;
  sortDirection: "ASC" | "DESC";
  onSort: (columnId: T) => void;
}

export function SortableTableHeader<T extends string>({
  columnId,
  headerText,
  currentSortColumn,
  sortDirection,
  onSort,
}: SortableTableHeaderProps<T>) {
  return (
    <Button
      variant="ghost"
      onClick={() => onSort(columnId)}
      className="has-[>svg]:px-0"
    >
      {headerText}
      {currentSortColumn === columnId ? (
        sortDirection === "DESC" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUp className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
