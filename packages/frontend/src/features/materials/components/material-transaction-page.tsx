import { DataTable } from "@/components/data-table";
import { MaterialArrivedDialog } from "@/components/dialogs/material-arrived-dialog";
import { MaterialDetailDialog } from "@/components/dialogs/material-detail-dialog";
import {
  MaterialSearchDialog,
  MaterialSearchFilter,
} from "@/components/dialogs/material-search";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterPills } from "@/components/ui/filter-pills";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadMaterialsXLSXButton } from "@/components/upload-materials-xlsx-button";
import { ordersColumns } from "@/features/materials/orders-columns";
import { purchasesColumns } from "@/features/materials/purchases-columns";
import { usePurchasesInfiniteQuery } from "@/features/materials/use-purchases-infinite-query";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc";
import { Material, MaterialKey } from "@myapp/shared";
import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";
import { NavigateOptions } from "@tanstack/react-router";
import {
  AccessorColumnDef,
  ColumnDef,
  RowSelectionState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useOrdersInfiniteQuery } from "../use-orders-infinite-query";

interface MaterialTransactionPageProps {
  filters: MaterialSearchFilter[];
  navigate: (options: NavigateOptions) => void;
  variant: "orders" | "purchases";
}

export function MaterialTransactionPage({
  filters,
  navigate,
  variant,
}: MaterialTransactionPageProps) {
  const [isViewingSelected, setIsViewingSelected] = useState(false);
  const [selectedMaterialObjects, setSelectedMaterialObjects] = useState<
    Record<string, Material>
  >({});

  const v = {
    orders: {
      title: "待進貨明細",
      columns: ordersColumns,
      useInfiniteQuery: useOrdersInfiniteQuery,
      queryKeyToInvalidate: trpc.warehouse.readOrders.infiniteQueryKey(),
    },
    purchases: {
      title: "進貨明細",
      columns: purchasesColumns,
      useInfiniteQuery: usePurchasesInfiniteQuery,
      queryKeyToInvalidate: trpc.warehouse.readPurchases.infiniteQueryKey(),
    },
  };

  const { title, columns, useInfiniteQuery, queryKeyToInvalidate } = v[variant];

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(filters);

  const isViewingFiltered = !isViewingSelected;

  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && isViewingFiltered && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const handleSearch = (searchFilters: MaterialSearchFilter[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        filters: searchFilters.map((v) => {
          if (v.field === "arrivalDate")
            return {
              field: v.field,
              value: format(v.value, "yyyy-MM-dd"),
            };

          return {
            field: v.field,
            value: v.value,
          };
        }),
      }),
    });
  };

  const handleRemoveFilter = (field: string) => {
    const newFilters = filters.filter((f) => f.field !== field);

    navigate({
      search: (prev) => ({ ...prev, filters: newFilters }),
    });
  };

  const handleClearFilters = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        filters: [],
      }),
    });
  };

  const filterDisplayMap = new Map(
    columns
      .filter(
        (c): c is AccessorColumnDef<Material, unknown> => "accessorKey" in c
      )
      .map((c) => [c.id as MaterialKey, c.header?.toString()])
  );

  const allMaterials = useMemo(
    () => data.pages.flatMap((page) => page.items),
    [data]
  );

  const rowSelection = useMemo(() => {
    return Object.keys(selectedMaterialObjects).reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {} as RowSelectionState);
  }, [selectedMaterialObjects]);

  const handleRowSelectionChange = useCallback(
    (updater: React.SetStateAction<RowSelectionState>) => {
      const currentSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;

      const newSelectedObjects: Record<string, Material> = {};
      for (const id in currentSelection) {
        if (currentSelection[id]) {
          // If the item is already in our cache, use it.
          if (selectedMaterialObjects[id]) {
            newSelectedObjects[id] = selectedMaterialObjects[id];
          } else {
            // Otherwise, find it in the currently loaded materials.
            const material = allMaterials.find((m) => m.id === id);
            if (material) {
              newSelectedObjects[id] = material;
            }
          }
        }
      }
      setSelectedMaterialObjects(newSelectedObjects);
    },
    [allMaterials, selectedMaterialObjects, rowSelection]
  );

  const selectedMaterials = useMemo(
    () => Object.values(selectedMaterialObjects),
    [selectedMaterialObjects]
  );

  const tableData = isViewingSelected ? selectedMaterials : allMaterials;

  const selectionColumn = useMemo<ColumnDef<Material>>(
    () => ({
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <div className="px-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    }),
    []
  );

  const tableColumns = useMemo(
    () => [selectionColumn, ...columns],
    [selectionColumn, columns]
  );

  return (
    <PageShell
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {isViewingFiltered && (
            <div className="flex space-x-2">
              <MaterialSearchDialog
                onSearch={handleSearch}
                routeFilters={filters}
                columns={columns}
              />
              <MaterialDetailDialog
                queryKeyToInvalidate={queryKeyToInvalidate}
              />
              <UploadMaterialsXLSXButton />
            </div>
          )}
        </div>
      }
      className="pb-6"
    >
      <>
        {isViewingFiltered && (
          <FilterPills
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearFilters={handleClearFilters}
            displayMap={filterDisplayMap}
          />
        )}
        {Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
            <div className="text-sm font-medium">
              已選則 {Object.keys(rowSelection).length} 個素材
            </div>
            <div className="flex items-center space-x-2">
              {title === "待進貨明細" && isViewingSelected && (
                <MaterialArrivedDialog
                  selectedMaterials={selectedMaterials}
                  onSuccess={() => {
                    setSelectedMaterialObjects({});
                    setIsViewingSelected(false);
                    handleClearFilters();
                  }}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewingSelected(!isViewingSelected)}
              >
                {isViewingSelected ? "顯示全部" : "顯示已選"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMaterialObjects({});
                  setIsViewingSelected(false);
                }}
              >
                清除已選
              </Button>
            </div>
          </div>
        )}
        <div className="border flex-1 relative ">
          <div className="absolute w-full inset-0">
            <ScrollArea className={cn("h-full", isFetching && "opacity-50")}>
              <DataTable
                columns={tableColumns}
                data={tableData}
                lastRowRef={ref}
                rowSelection={rowSelection}
                setRowSelection={handleRowSelectionChange}
              />
              <ScrollAreaScrollbar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
        {!hasNextPage && allMaterials.length > 0 && (
          <p className="text-center text-sm text-muted-foreground p-4">
            No more materials to load.
          </p>
        )}
      </>
    </PageShell>
  );
}
