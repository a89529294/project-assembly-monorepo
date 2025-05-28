import { DeleteButton } from "@/components/delete-button";
import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { SummaryPageDataTable } from "@/components/summary-page/summary-page-data-table";
import { SummaryPageHeader } from "@/components/summary-page/summary-page-header";
import { Button } from "@/components/ui/button";
import { SummaryPageProvider } from "@/contexts/summary-page-context";
import { genEmployeeColumns } from "@/features/employees/data-table/columns";
import { useDeleteEmployees } from "@/hooks/employees/use-delete-employees";
import { useDeferredPaginatedTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { employeesSummaryQueryInputSchema } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/basic-info/employees/")({
  validateSearch: employeesSummaryQueryInputSchema,
  loaderDeps: ({ search }) => search,

  async loader({ deps }) {
    queryClient.ensureQueryData(
      trpc.basicInfo.readEmployees.queryOptions(deps)
    );
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const deferredTableControlsReturn = useDeferredPaginatedTableControls(search);
  const { data } = useSuspenseQuery(
    trpc.basicInfo.readEmployees.queryOptions(
      deferredTableControlsReturn.deferredValues
    )
  );

  return (
    <SummaryPageProvider
      data={data}
      deferredTableControlsReturn={deferredTableControlsReturn}
      columnsGeneratorFunction={genEmployeeColumns}
      navigate={(a) => navigate({ search: a.search })}
    >
      <PageShell
        header={
          <SummaryPageHeader
            title="員工清單"
            createAction={
              <Button
                asChild
                disabled={deferredTableControlsReturn.isUpdatingTableData}
              >
                <Link to="/basic-info/employees/create">新增</Link>
              </Button>
            }
            deleteAction={(props) => (
              <DeleteButton
                useDeleteHook={useDeleteEmployees}
                hookProps={props}
              >
                移除員工
              </DeleteButton>
            )}
          />
        }
      >
        <SummaryPageDataTable />
      </PageShell>
    </SummaryPageProvider>
  );
}
