import { DataTable } from "@/components/data-table";
import { DialogDepartment } from "@/components/dialogs/department";
import { SearchBar } from "@/components/search-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { genExtendedDepartmentColumns } from "@/features/departments/data-table/columns";
import { useSuspendedDepartments } from "@/hooks/departments/use-suspended-departments";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue } from "react";
import { z } from "zod";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/departments"
)({
  validateSearch: z.object({ searchTerm: z.string().default("") }),
  loaderDeps: ({ search: { searchTerm } }) => ({ searchTerm }),
  loader({ deps: { searchTerm } }) {
    queryClient.ensureQueryData(
      trpc.personnelPermission.readDepartments.queryOptions({ searchTerm })
    );
  },
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
  component: RouteComponent,
});

function RouteComponent() {
  const { searchTerm } = Route.useSearch();
  const navigate = Route.useNavigate();
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const { data: departments } = useSuspendedDepartments(deferredSearchTerm);
  console.log(departments);

  const isPending = searchTerm !== deferredSearchTerm;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center pb-4">
        <div className="flex gap-2">
          <h1 className="text-2xl font-bold">部門管理</h1>
          <SearchBar
            onSearchChange={(searchTerm) =>
              navigate({ search: { searchTerm } })
            }
            initSearchTerm={searchTerm}
          />
        </div>
        <DialogDepartment />
      </div>

      <div className="relative flex-1">
        <div className="absolute inset-0">
          <ScrollArea className={cn("h-full", isPending && "opacity-50")}>
            <DataTable
              columns={genExtendedDepartmentColumns()}
              data={Array(1).fill(departments).flat()}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
