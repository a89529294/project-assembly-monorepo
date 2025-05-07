import { DataTable } from "@/components/data-table";
import { SmartPagination } from "@/components/pagination";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { genEmployeeColumns } from "@/features/employees/data-table/columns";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { employeesSummaryQueryInputSchema } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue } from "react";

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
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
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

  console.log(searchTerm);
  console.log(typeof searchTerm);

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
            }}
            initSearchTerm={searchTerm}
          />
        </div>
        <Button asChild>
          <Link to="/basic-info/employees/create">新增員工</Link>
        </Button>
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
