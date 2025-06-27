import { RowSelectionState } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/data-table";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { PageShell } from "@/components/layout/page-shell";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MaterialSearchDialog,
  MaterialSearchFilter,
} from "@/components/dialogs/material-search";
import { MaterialArrivedDialog } from "@/components/dialogs/material-arrived-dialog";
import { MaterialCreateDialog } from "@/components/dialogs/material-create-dialog";
import { Material, MaterialKey } from "@myapp/shared";
import { FilterPills } from "@/components/ui/filter-pills";
import { AccessorColumnDef, ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UploadMaterialsXLSXButton } from "@/components/upload-materials-xlsx-button";
import { OrdersInfiniteQueryResult } from "../use-orders-infinite-query";
import { NavigateOptions } from "@tanstack/react-router";
import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";

interface MaterialTransactionPageProps {
  title: string;
  filters: MaterialSearchFilter[];
  useInfiniteQuery: (
    filters: MaterialSearchFilter[]
  ) => OrdersInfiniteQueryResult;
  navigate: (options: NavigateOptions) => void;
  columns: ColumnDef<Material>[];
}

export function MaterialTransactionPage({
  title,
  filters,
  useInfiniteQuery,
  navigate,
  columns,
}: MaterialTransactionPageProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(filters);

  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
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

  const allMaterials = data.pages.flatMap((page) => page.items);

  const selectedMaterials = allMaterials.filter((material) =>
    Object.keys(rowSelection).includes(material.id)
  );

  const selectionColumn: ColumnDef<Material> = {
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
  };

  return (
    <PageShell
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="flex space-x-2">
            <MaterialSearchDialog
              onSearch={handleSearch}
              routeFilters={filters}
              columns={columns}
            />
            <MaterialCreateDialog />
            <UploadMaterialsXLSXButton />
            {title === "待進貨明細" && (
              <MaterialArrivedDialog selectedMaterials={selectedMaterials} />
            )}
          </div>
        </div>
      }
      className="pb-6"
    >
      <>
        <FilterPills
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearFilters={handleClearFilters}
          displayMap={filterDisplayMap}
        />
        <div className="border flex-1 relative ">
          <div className="absolute w-full inset-0">
            <ScrollArea className={cn("h-full", isFetching && "opacity-50")}>
              <DataTable
                columns={[selectionColumn, ...columns]}
                data={allMaterials}
                lastRowRef={ref}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
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
