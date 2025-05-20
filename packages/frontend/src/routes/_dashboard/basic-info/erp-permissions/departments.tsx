import { DialogDepartment } from "@/components/dialogs/department";
import { PageShell } from "@/components/page-shell";
import { SummaryPageDataTable } from "@/components/summary-page/summary-page-data-table";
import { SummaryPageHeader } from "@/components/summary-page/summary-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryPageProvider } from "@/contexts/summary-page-context";
import { genExtendedDepartmentColumns } from "@/features/departments/data-table/columns";
import { useSuspendedDepartmentsPaginated } from "@/hooks/departments/use-suspended-departments-paginated";
import { useDeferredPaginatedTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { departmentsSummaryQueryInputSchema } from "@myapp/shared";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/departments"
)({
  validateSearch: departmentsSummaryQueryInputSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader({ deps: { search } }) {
    queryClient.ensureQueryData(
      trpc.personnelPermission.readPaginatedDepartments.queryOptions(search)
    );
  },
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const deferredSearch = useDeferredPaginatedTableControls(search);
  const { data: departments } = useSuspendedDepartmentsPaginated(
    deferredSearch.deferredValues
  );

  return (
    <PageShell>
      <SummaryPageProvider
        columnsGeneratorFunction={genExtendedDepartmentColumns}
        data={departments}
        deferredTableControlsReturn={deferredSearch}
        navigate={navigate}
      >
        <SummaryPageHeader
          title="部門管理"
          createAction={<DialogDepartment />}
        />
        <SummaryPageDataTable />
      </SummaryPageProvider>
    </PageShell>
  );
}
