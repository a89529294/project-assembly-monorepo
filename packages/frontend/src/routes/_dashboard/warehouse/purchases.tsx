import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";

import { useInView } from "react-intersection-observer";
import { useMemo } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { PageShell } from "@/components/layout/page-shell";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MaterialSearchDialog,
  MaterialSearchFilter,
} from "@/components/dialogs/material-search";
import { MaterialCreateDialog } from "@/components/dialogs/material-create-dialog";
import { materialColumns } from "@/features/materials/columns";
import { keyOfMaterialSchema, Material, MaterialKey } from "@myapp/shared";
import { FilterPills } from "@/components/ui/filter-pills";
import { AccessorColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { PendingComponent } from "@/components/pending-component";
import { z } from "zod";

export const Route = createFileRoute("/_dashboard/warehouse/purchases")({
  validateSearch: z.object({
    filters: z
      .array(
        z.object({
          field: keyOfMaterialSchema,
          value: z.string(),
        })
      )
      .optional()
      .default([{ field: "labelId" as const, value: "" }]),
  }),
  pendingComponent: PendingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { filters } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      trpc.warehouse.readPurchases.infiniteQueryOptions(
        { cursor: 0, filters },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
      )
    );

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
      search: (prev) => ({ ...prev, filters: searchFilters }),
    });
  };

  const handleRemoveFilter = (field: string) => {
    const newFilters = filters.filter((f) => f.field !== field && f.value);
    navigate({
      search: (prev) => ({ ...prev, filters: newFilters }),
    });
  };

  const handleClearFilters = () => {
    navigate({
      search: (prev) => ({ ...prev, filters: [] }),
    });
  };

  const filterDisplayMap = useMemo(() => {
    return new Map(
      materialColumns
        .filter(
          (c): c is AccessorColumnDef<Material, unknown> => "accessorKey" in c
        )
        .map((c) => [c.id as MaterialKey, c.header?.toString()])
    );
  }, []);

  const allMaterials = data.pages.flatMap((page) => page.items);

  return (
    <PageShell
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">進貨明細</h1>
          <div className="flex space-x-2">
            <MaterialSearchDialog onSearch={handleSearch} />
            <MaterialCreateDialog />
            <Button variant="secondary">編輯素材</Button>{" "}
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
            <ScrollArea
              className={cn("h-full", isFetching && "opacity-50")}
            >
              <DataTable
                columns={materialColumns}
                data={allMaterials}
                lastRowRef={ref}
              />
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
