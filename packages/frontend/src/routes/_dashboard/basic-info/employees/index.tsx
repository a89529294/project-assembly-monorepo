import { DataTable } from "@/components/data-table";
import { SmartPagination } from "@/components/pagination";
import { PendingComponent } from "@/components/pending-component";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { genEmployeeColumns } from "@/features/employees/data-table/columns";
import { useSelection } from "@/hooks/use-selection";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { employeesSummaryQueryInputSchema } from "@myapp/shared";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_dashboard/basic-info/employees/")({
  validateSearch: employeesSummaryQueryInputSchema,
  loaderDeps: ({
    search: { page, pageSize, orderBy, orderDirection, searchTerm },
  }) => ({
    page,
    pageSize,
    orderBy,
    orderDirection,
    searchTerm,
  }),

  async loader({
    deps: { page, pageSize, orderBy, orderDirection, searchTerm },
  }) {
    queryClient.ensureQueryData(
      trpc.basicInfo.readEmployees.queryOptions({
        page,
        pageSize,
        orderBy,
        orderDirection,
        searchTerm,
      })
    );
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { page, pageSize, orderBy, orderDirection, searchTerm } =
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
  const { data: employees } = useSuspenseQuery(
    trpc.basicInfo.readEmployees.queryOptions({
      page: deferredPage,
      pageSize,
      orderBy: deferredOrderBy,
      orderDirection: deferredOrderDirection,
      searchTerm: deferredSearchTerm,
    })
  );
  const {
    onSelectionChange,
    onSelectAllChange,
    selection,
    selectedCount,
    rowSelection,
    resetSelection,
    data: selectedUsers,
  } = useSelection({
    totalFilteredCount: employees.total,
    pageIds: employees.data.map((e) => e.id),
  });
  const { mutate, isPending } = useMutation(
    trpc.basicInfo.deleteEmployees.mutationOptions()
  );

  const onDeleteEmployees = () => {
    mutate(selectedUsers, {
      onSuccess() {
        toast.success("成功移除員工");

        queryClient.invalidateQueries({
          queryKey: trpc.basicInfo.readEmployees.queryKey(),
        });

        resetSelection();
      },
      onError() {
        toast.error("無法移除員工");
      },
    });
  };

  return (
    <div className="p-6 pb-0 bg-white flex flex-col rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 flex justify-between">
        <div className="flex gap-3 items-center">
          員工清單
          <SearchBar
            onSearchChange={(searchTerm) => {
              navigate({
                search: { searchTerm },
                replace: true,
              });
              resetSelection();
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
                onClick={onDeleteEmployees}
                disabled={isPending}
              >
                移除員工員工
              </Button>
            </div>
          )}
          <Button asChild disabled={isPending}>
            <Link to="/basic-info/employees/create">新增員工</Link>
          </Button>
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
              columns={genEmployeeColumns({
                selection,
                onSelectAllChange,
                orderBy,
                orderDirection,
                clickOnCurrentHeader: (columnId) => {
                  navigate({
                    search: {
                      page: 1,
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
                    },
                  });
                },
              })}
              data={employees.data}
              rowSelection={rowSelection}
              setRowSelection={onSelectionChange}
            />
          </ScrollArea>
        </div>
        <SmartPagination
          className="absolute bottom-0 h-10 flex items-center"
          totalPages={employees.totalPages}
          currentPage={deferredPage}
          onPageChange={(newPage) =>
            navigate({
              to: "/basic-info/employees",
              search: { page: newPage, pageSize, orderBy, orderDirection },
            })
          }
        />
      </div>
    </div>
  );
}
