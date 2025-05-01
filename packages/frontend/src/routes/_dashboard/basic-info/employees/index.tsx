import { DataTable } from "@/components/data-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { employeeColumns } from "@/features/employees/data-table/columns";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/basic-info/employees/")({
  async loader() {
    await queryClient.ensureQueryData(
      trpc.basicInfo.getEmployees.queryOptions()
    );
  },
  component: RouteComponent,
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
});

function RouteComponent() {
  const { data: employees } = useSuspenseQuery(
    trpc.basicInfo.getEmployees.queryOptions()
  );
  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4">員工清單</h2>
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <ScrollArea className="rounded-md border p-0 h-full">
            <DataTable columns={employeeColumns} data={employees} />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
