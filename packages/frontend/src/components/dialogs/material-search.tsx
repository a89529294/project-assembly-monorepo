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
import { materialColumns } from "@/features/materials/columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XIcon } from "lucide-react";
import { Material, MaterialKey } from "@myapp/shared";
import { AccessorColumnDef } from "@tanstack/react-table";
import { getRouteApi } from "@tanstack/react-router";

export type MaterialSearchFilter = {
  field: MaterialKey;
  value: string;
};

interface MaterialSearchDialogProps {
  onSearch: (filters: MaterialSearchFilter[]) => void;
}

const searchableFields = materialColumns
  .filter((c): c is AccessorColumnDef<Material> => "accessorKey" in c)
  .map((c) => ({ key: c.id as MaterialKey, header: c.header }));

const purchasesRouteApi = getRouteApi("/_dashboard/warehouse/purchases");

export function MaterialSearchDialog({ onSearch }: MaterialSearchDialogProps) {
  const { filters: routeFilters } = purchasesRouteApi.useSearch();
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(routeFilters);

  useEffect(() => {
    if (open) {
      setLocalFilters(routeFilters);
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
    if (localFilters.length === 1) return;

    setLocalFilters(localFilters.filter((f) => f.field !== field));
  };

  const handleReset = () => {
    setLocalFilters([]);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">搜尋</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>素材搜尋</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {localFilters.map((filter, index) => (
            <div key={filter.field} className="flex items-center gap-2">
              <Select
                value={filter.field}
                onValueChange={(value: MaterialKey) => {
                  const newFilters = [...localFilters];
                  newFilters[index] = {
                    ...newFilters[index],
                    field: value,
                    value: "",
                  };
                  setLocalFilters(newFilters);
                }}
              >
                <SelectTrigger className="w-[180px]">
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
                className="flex-grow"
              />
              {localFilters.length !== 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFilter(filter.field)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
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
                  .filter((f) => f.field && f.value)
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
