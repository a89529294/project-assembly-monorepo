import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { SummaryPageDataTable } from "@/components/summary-page/summary-page-data-table";
import { SummaryPageHeader } from "@/components/summary-page/summary-page-header";
import { Button } from "@/components/ui/button";
import { SummaryPageProvider } from "@/contexts/summary-page-context";
import { useDeferredPaginatedTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { projectsSearchSchema } from "@myapp/shared";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

// Temporary project columns definition
const projectColumns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Project Name",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
  },
];

export const Route = createFileRoute(
  "/_dashboard/customers/$customerId/projects/"
)({
  validateSearch: projectsSearchSchema,
  loaderDeps: ({ search }) => ({
    search,
  }),
  loader({ deps: { search }, params: { customerId } }) {
    // TODO: Replace with actual projects query for the specific customer
    // Using readCustomers as a placeholder - replace with actual projects query when available
    queryClient.ensureQueryData(
      trpc.basicInfo.readCustomerProjects.queryOptions({
        customerId,
        search,
      })
    );
  },
  pendingComponent: PendingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { customerId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const deferredTableControlsReturn = useDeferredPaginatedTableControls(search);
  const { data } = useSuspenseQuery(
    trpc.basicInfo.readCustomerProjects.queryOptions({
      customerId,
      search: deferredTableControlsReturn.deferredValues,
    })
  );

  return (
    <SummaryPageProvider
      data={data}
      deferredTableControlsReturn={deferredTableControlsReturn}
      columnsGeneratorFunction={() => projectColumns}
      navigate={(a) =>
        navigate({
          search: a.search,
        })
      }
    >
      <PageShell
        header={
          <SummaryPageHeader
            title="Projects"
            createAction={
              <Button asChild>
                <Link
                  to="/customers/$customerId/projects/create"
                  params={{ customerId }}
                >
                  新增專案
                </Link>
              </Button>
            }
          />
        }
      >
        <SummaryPageDataTable />
      </PageShell>
    </SummaryPageProvider>
  );
}
