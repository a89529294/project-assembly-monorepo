import { DataTable } from "@/components/data-table";
import { DialogAddUser } from "@/components/dialogs/add-user";
import { SmartPagination } from "@/components/pagination";
import { PendingComponent } from "@/components/pending-component";
import { SearchBar } from "@/components/search-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { genUserColumns } from "@/features/users/data-table/columns";
import { useGlobalSelection } from "@/hooks/use-global-selection";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { UsersSummaryQueryInputSchema } from "@myapp/shared";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/users"
)({
  validateSearch: UsersSummaryQueryInputSchema,
  loaderDeps: ({
    search: { orderBy, orderDirection, page, pageSize, searchTerm },
  }) => ({
    page,
    pageSize,
    orderBy,
    orderDirection,
    searchTerm,
  }),
  async loader({ deps }) {
    queryClient.ensureQueryData(
      trpc.personnelPermission.readUsers.queryOptions(deps)
    );
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { orderBy, orderDirection, page, pageSize, searchTerm } =
    Route.useSearch();

  const deferredPage = useDeferredValue(page);
  const deferredOrderBy = useDeferredValue(orderBy);
  const deferredOrderDirection = useDeferredValue(orderDirection);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loading =
    page !== deferredPage ||
    orderBy !== deferredOrderBy ||
    orderDirection !== deferredOrderDirection ||
    searchTerm !== deferredSearchTerm;

  const navigate = Route.useNavigate();
  const { data: usersData } = useSuspenseQuery(
    trpc.personnelPermission.readUsers.queryOptions({
      orderBy: deferredOrderBy,
      orderDirection: deferredOrderDirection,
      page: deferredPage,
      searchTerm: deferredSearchTerm,
      pageSize,
    })
  );
  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.deleteUsers.mutationOptions()
  );

  // Initialize global selection with total count from API
  const {
    getPageSelectedIds,
    handleSelectionChange,
    toggleSelectAll,
    selection,
    selectedCount,
    resetSelection,
    setDeselectedId,
    setReselectedId,
  } = useGlobalSelection({
    totalFilteredCount: usersData.total,
  });

  // Reset selection when filter criteria change
  useEffect(() => {
    resetSelection();
  }, [searchTerm, resetSelection]);

  // Get current page IDs for selection state
  const currentPageIds = usersData.data.map((user) => user.id);

  // Get selection state for current page
  const rowSelection = getPageSelectedIds(currentPageIds);

  const onDeleteUsers = () => {
    const config = {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: trpc.personnelPermission.readUsers.queryKey(),
        });
        toast.success("成功移除ERP使用者");
        resetSelection();
      },
    };

    if (selection.selectAll) {
      mutate(
        {
          searchTerm,
          deSelectedIds: Array.from(selection.deselectedIds),
        },
        config
      );
    } else {
      mutate({ userIds: Array.from(selection.selectedIds) }, config);
    }
  };

  console.log(trpc.personnelPermission.readUsers.pathKey);
  console.log(trpc.personnelPermission.readUsers.queryKey());

  // This function can be used to send selected data to backend
  // const processSelection = () => {
  //   if (selectAll) {
  //     // When in "select all" mode, send:
  //     return {
  //       selectAll: true,
  //       excludedIds: Array.from(deselectedIds),
  //     };
  //   } else {
  //     // When in normal mode, send just the selected IDs
  //     return {
  //       selectAll: false,
  //       selectedIds: Array.from(selectedIds),
  //     };
  //   }
  // };

  return (
    <div className="p-6 pb-0 bg-white flex flex-col rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 flex justify-between">
        <div className="flex gap-3 items-center">
          ERP使用者清單
          <SearchBar
            onSearchChange={(searchTerm) => {
              navigate({
                search: { searchTerm },
                replace: true,
              });
            }}
            initSearchTerm={searchTerm}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal">
                已選擇 {selectedCount} 個使用者
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteUsers}
                disabled={isPending}
              >
                移除ERP使用者
              </Button>
            </div>
          )}
          <DialogAddUser disabled={isPending} />
        </div>
      </h2>
      <div className="flex-1 relative">
        <div className="absolute inset-0 bottom-10">
          <ScrollArea
            className={cn(
              "rounded-md border p-0 h-full",
              loading && "opacity-50"
            )}
          >
            <DataTable
              columns={genUserColumns({
                orderBy,
                orderDirection,
                clickOnCurrentHeader: (columnId) => {
                  navigate({
                    search: {
                      page: 1,
                      pageSize,
                      orderBy: columnId,
                      orderDirection:
                        orderDirection === "DESC" ? "ASC" : "DESC",
                    },
                  });
                },
                clickOnOtherHeader: (columnId) => {
                  navigate({
                    search: {
                      page: 1,
                      orderBy: columnId,
                      orderDirection: "DESC",
                      pageSize,
                    },
                  });
                },
                onSelectAllChange: toggleSelectAll,
                selection,
                setDeselectedId,
                setReselectedId,
                totalFilteredCount: usersData.total,
              })}
              data={usersData.data}
              rowSelection={rowSelection}
              setRowSelection={handleSelectionChange}
            />
          </ScrollArea>
        </div>
        <SmartPagination
          className="absolute bottom-0 h-10 flex items-center"
          totalPages={usersData.totalPages}
          currentPage={deferredPage}
          onPageChange={(newPage) =>
            navigate({
              search: {
                page: newPage,
                pageSize,
                orderBy,
                orderDirection,
                searchTerm,
              },
            })
          }
        />
      </div>
    </div>
  );
}
