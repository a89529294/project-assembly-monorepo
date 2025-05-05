import { DataTable } from "@/components/data-table";
import { SmartPagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { genUserColumns } from "@/features/users/data-table/columns";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { UsersSummaryQueryInputSchema } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue } from "react";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/users"
)({
  validateSearch: (s) => {
    console.log(UsersSummaryQueryInputSchema.safeParse(s).error);

    return UsersSummaryQueryInputSchema.parse(s);
  },
  loaderDeps: ({ search: { users, employees } }) => ({
    users: {
      page: users.page,
      pageSize: users.pageSize,
      orderBy: users.orderBy,
      orderDirection: users.orderDirection,
      searchTerm: users.searchTerm,
    },
    employees: {
      page: employees.page,
      pageSize: employees.pageSize,
      orderBy: employees.orderBy,
      orderDirection: employees.orderDirection,
      searchTerm: employees.searchTerm,
    },
  }),
  async loader({ deps: { users, employees } }) {
    queryClient.ensureQueryData(
      trpc.basicInfo.readUsers.queryOptions({
        users,
        employees,
      })
    );
  },
  component: RouteComponent,
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
});

// TODO contninue working on this, missing a ton of functionality
function RouteComponent() {
  const { users, employees } = Route.useSearch();
  const deferredPage = useDeferredValue(users.page);
  const deferredOrderBy = useDeferredValue(users.orderBy);
  const deferredOrderDirection = useDeferredValue(users.orderDirection);
  // may need to add searchTerm, after implementing search
  const loading =
    users.page !== deferredPage ||
    users.orderBy !== deferredOrderBy ||
    users.orderDirection !== deferredOrderDirection;

  const navigate = Route.useNavigate();
  const { data: usersData } = useSuspenseQuery(
    trpc.basicInfo.readUsers.queryOptions({
      users: {
        ...users,
        page: deferredPage,
        orderBy: deferredOrderBy,
        orderDirection: deferredOrderDirection,
      },
      employees,
    })
  );

  return (
    <div className="p-6 pb-0 bg-white flex flex-col rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 flex justify-between">
        ERP使用者清單
        <Button asChild>
          <Link to="/basic-info/employees/create">新增ERP使用者</Link>
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
              columns={genUserColumns({
                orderBy: users.orderBy,
                orderDirection: users.orderDirection,
                clickOnCurrentHeader: (columnId) => {
                  navigate({
                    search: {
                      users: {
                        page: 1,
                        pageSize: users.pageSize,
                        orderBy: columnId,
                        orderDirection:
                          users.orderDirection === "DESC" ? "ASC" : "DESC",
                      },
                      employees: employees,
                    },
                  });
                },
                clickOnOtherHeader: (columnId) => {
                  navigate({
                    search: {
                      users: {
                        page: 1,
                        orderBy: columnId,
                        orderDirection: "DESC",
                        pageSize: users.pageSize,
                      },
                      employees: employees,
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
                users: {
                  page: newPage,
                  pageSize: users.pageSize,
                  orderBy: users.orderBy,
                  orderDirection: users.orderDirection,
                },
                employees: employees,
              },
            })
          }
        />
      </div>
    </div>
  );
}
