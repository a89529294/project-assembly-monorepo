import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { employeeColumns } from "@/features/employees/data-table/columns";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SmartPagination } from "@/components/pagination";
import { useDeferredValue } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard/basic-info/employees/")({
  validateSearch: z.object({
    page: z.number().int().catch(1),
    pageSize: z.number().int().catch(20),
  }),
  loaderDeps: ({ search: { page, pageSize } }) => ({ page, pageSize }),
  async loader({ deps: { page, pageSize } }) {
    queryClient.ensureQueryData(
      trpc.basicInfo.readEmployees.queryOptions({
        page,
        pageSize,
      })
    );
  },
  component: RouteComponent,
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
});

function RouteComponent() {
  const { page, pageSize } = Route.useSearch();
  const deferredPage = useDeferredValue(page);
  const loading = page !== deferredPage;
  const navigate = Route.useNavigate();
  const { data: employees } = useSuspenseQuery(
    trpc.basicInfo.readEmployees.queryOptions({ page: deferredPage, pageSize })
  );

  return (
    <div className="p-6 pb-0 bg-white flex flex-col rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 flex justify-between">
        員工清單
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
            <DataTable columns={employeeColumns} data={employees.data} />
          </ScrollArea>
        </div>
        <SmartPagination
          className="absolute bottom-0 h-10 flex items-center"
          totalPages={employees.totalPages}
          currentPage={deferredPage}
          onPageChange={(newPage) =>
            navigate({ search: { page: newPage, pageSize } })
          }
        />
      </div>
    </div>
  );
}
