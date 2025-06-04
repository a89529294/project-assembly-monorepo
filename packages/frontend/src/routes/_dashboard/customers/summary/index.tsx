import { DeleteButton } from "@/components/delete-button";
import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { SummaryPageDataTable } from "@/components/summary-page/summary-page-data-table";
import { SummaryPageHeader } from "@/components/summary-page/summary-page-header";
import { Button } from "@/components/ui/button";
import { SummaryPageProvider } from "@/contexts/summary-page-context";
import { genCustomerColumns } from "@/features/customers/data-table/columns";
import { useDeleteCustomers } from "@/hooks/customers/use-delete-customers";
import { useDeferredPaginatedTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { customersSummaryQueryInputSchema } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/customers/summary/")({
  validateSearch: customersSummaryQueryInputSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader({ deps: { search } }) {
    queryClient.ensureQueryData(
      trpc.basicInfo.readCustomers.queryOptions(search)
    );
  },
  pendingComponent: PendingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const deferredTableControlsReturn = useDeferredPaginatedTableControls(search);
  const { data } = useSuspenseQuery(
    trpc.basicInfo.readCustomers.queryOptions(
      deferredTableControlsReturn.deferredValues
    )
  );

  return (
    <SummaryPageProvider
      // initialSearch={search}
      data={data}
      deferredTableControlsReturn={deferredTableControlsReturn}
      columnsGeneratorFunction={genCustomerColumns}
      navigate={(a) => navigate({ search: a.search })}
    >
      <PageShell
        header={
          <SummaryPageHeader
            title="客戶清單"
            createAction={
              <Button
                asChild
                disabled={deferredTableControlsReturn.isUpdatingTableData}
              >
                <Link to="/customers/create">新增</Link>
              </Button>
            }
            deleteAction={(props) => (
              <DeleteButton
                useDeleteHook={useDeleteCustomers}
                hookProps={props}
              >
                移除客戶
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
