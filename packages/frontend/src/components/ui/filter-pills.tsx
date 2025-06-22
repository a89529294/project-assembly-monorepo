import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialSearchFilter } from "@/components/dialogs/material-search";
import { XIcon } from "lucide-react";

interface FilterPillsProps {
  filters: MaterialSearchFilter[];
  onRemoveFilter: (field: string) => void;
  onClearFilters: () => void;
  displayMap: Map<string, string | undefined>;
}

export function FilterPills({
  filters,
  onRemoveFilter,
  onClearFilters,
  displayMap,
}: FilterPillsProps) {
  const activeFilters = filters.filter((f) => f.value);
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 py-2 flex-wrap">
      <span className="text-sm font-medium">搜尋條件:</span>
      {activeFilters.map((filter) => {
        const displayName = displayMap.get(filter.field) ?? filter.field;
        return (
          <Badge
            key={filter.field}
            variant="secondary"
            className="flex items-center gap-1 pl-2 pr-1"
          >
            <span>
              {displayName}: {filter.value}
            </span>
            <button
              onClick={() => onRemoveFilter(filter.field)}
              className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              aria-label={`Remove ${displayName} filter`}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}
      <Button variant="ghost" size="sm" onClick={onClearFilters} className="underline">
        清除全部
      </Button>
    </div>
  );
}
