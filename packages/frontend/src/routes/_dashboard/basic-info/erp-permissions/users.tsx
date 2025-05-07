import { DataTable } from "@/components/data-table";
import { DialogAddUser } from "@/components/dialogs/add-user";
import { SmartPagination } from "@/components/pagination";
import { SearchBar } from "@/components/search-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { genUserColumns } from "@/features/users/data-table/columns";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { UsersSummaryQueryInputSchema } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue } from "react";

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
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
});

// TODO contninue working on this, missing a ton of functionality
function RouteComponent() {
  const { orderBy, orderDirection, page, pageSize, searchTerm } =
    Route.useSearch();
  const deferredPage = useDeferredValue(page);
  const deferredOrderBy = useDeferredValue(orderBy);
  const deferredOrderDirection = useDeferredValue(orderDirection);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  // may need to add searchTerm, after implementing search
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
          />
        </div>
        <DialogAddUser />
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
              })}
              data={usersData.data}
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
              },
            })
          }
        />
      </div>
    </div>
  );
}
