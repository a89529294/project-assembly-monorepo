import { DataTable } from "@/components/data-table";
import { DialogDepartment } from "@/components/dialogs/department";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { genExtendedDepartmentColumns } from "@/features/departments/data-table/columns";
import { useSuspendedDepartments } from "@/hooks/departments/use-suspended-departments";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/departments"
)({
  loader() {
    queryClient.ensureQueryData(
      trpc.personnelPermission.readDepartments.queryOptions()
    );
  },
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
  component: RouteComponent,
});

function RouteComponent() {
  const { data: departments } = useSuspendedDepartments();

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center pb-4">
        <h1 className="text-2xl font-bold">部門管理</h1>
        <DialogDepartment />
      </div>

      <div className="relative flex-1">
        <div className="absolute inset-0">
          <ScrollArea className="h-full">
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
