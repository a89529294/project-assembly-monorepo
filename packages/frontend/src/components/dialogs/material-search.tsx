import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XIcon } from "lucide-react";
import { Material, MaterialKey } from "@myapp/shared";
import { AccessorColumnDef, ColumnDef } from "@tanstack/react-table";

import { YearMonthDateCalendar } from "@/components/year-month-date-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export type MaterialSearchFilter = {
  field: MaterialKey;
  value: string;
};

interface MaterialSearchDialogProps {
  onSearch: (filters: MaterialSearchFilter[]) => void;
  routeFilters: MaterialSearchFilter[];
  columns: ColumnDef<Material>[];
}

const defaultFilters = [
  {
    field: "labelId" as const,
    value: "",
  },
];

const dateFields = ["arrivalDate"];

export function MaterialSearchDialog({
  onSearch,
  routeFilters,
  columns,
}: MaterialSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(routeFilters);
  const searchableFields = columns
    .filter((c): c is AccessorColumnDef<Material> => "accessorKey" in c)
    .map((c) => ({ key: c.id as MaterialKey, header: c.header }));

  useEffect(() => {
    if (open) {
      setLocalFilters(routeFilters.length ? routeFilters : defaultFilters);
    }
  }, [open, routeFilters]);

  const usedFields = new Set(localFilters.map((f) => f.field));

  const handleAddFilter = () => {
    const nextField = searchableFields.find((f) => !usedFields.has(f.key));
    if (nextField) {
      setLocalFilters([...localFilters, { field: nextField.key, value: "" }]);
    }
  };

  const handleRemoveFilter = (field: MaterialKey) => {
    setLocalFilters(localFilters.filter((f) => f.field !== field));
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">素材搜尋</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>素材搜尋</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-4">
          {localFilters.map((filter, index) => (
            <div key={filter.field} className="flex items-center gap-2">
              <Select
                value={filter.field}
                onValueChange={(field: MaterialKey) => {
                  const newFilters = [...localFilters];
                  newFilters[index] = {
                    field,
                    value: "",
                  };
                  setLocalFilters(newFilters);
                }}
              >
                <SelectTrigger className="w-[104px] shrink-0">
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {searchableFields.map((col) => (
                    <SelectItem
                      key={col.key}
                      value={col.key}
                      disabled={usedFields.has(col.key)}
                    >
                      {col.header?.toString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {dateFields.includes(filter.field) ? (
                <PopoverCalendar
                  filter={filter}
                  onChange={(s) => {
                    console.log(s);
                    const newFilters = [...localFilters];
                    newFilters[index] = {
                      ...newFilters[index],
                      value: s?.toISOString() ?? "",
                    };
                    setLocalFilters(newFilters);
                  }}
                />
              ) : (
                <Input
                  placeholder="Value"
                  value={filter.value}
                  onChange={(e) => {
                    const newFilters = [...localFilters];
                    newFilters[index] = {
                      ...newFilters[index],
                      value: e.target.value,
                    };
                    setLocalFilters(newFilters);
                  }}
                  className=""
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter(filter.field)}
                className="-ml-2"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleAddFilter}
            disabled={localFilters.length >= searchableFields.length}
          >
            新增搜尋項目
          </Button>
          <div>
            <Button variant="ghost" onClick={handleReset}>
              重置
            </Button>
            <Button
              onClick={() => {
                const searchPayload = localFilters
                  .filter((f) => f.value)
                  .map(({ field, value }) => ({ field, value }));
                onSearch(searchPayload);
                setOpen(false);
              }}
            >
              搜尋
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PopoverCalendar({
  filter,
  onChange,
}: {
  filter: MaterialSearchFilter;
  onChange: (s: Date | null | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "pl-3 text-left font-normal disabled:opacity-50 flex-1",
            !filter.value && "text-muted-foreground"
          )}
        >
          {filter.value ? (
            format(filter.value, "yyyy年MM月dd日")
          ) : (
            <span>選一個日期</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <YearMonthDateCalendar
          value={filter.value ? new Date(filter.value) : undefined}
          onChange={(s) => {
            onChange(s);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
