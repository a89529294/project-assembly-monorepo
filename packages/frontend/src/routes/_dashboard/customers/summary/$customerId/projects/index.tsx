import { RevealOnHover } from "@/components/data-table/hoverable-action-cell";
import { DialogDeleteCustomer } from "@/components/dialogs/delete-customer";
import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { SummaryPageDataTable } from "@/components/summary-page/summary-page-data-table";
import { SummaryPageHeader } from "@/components/summary-page/summary-page-header";
import { Button } from "@/components/ui/button";
import { SummaryPageProvider } from "@/contexts/summary-page-context";
import { useDeferredPaginatedTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import {
  projectsSearchSchema,
  ProjectStatus,
  projectStatusToLabel,
  ProjectSummary,
} from "@myapp/shared";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { LucideReceiptText } from "lucide-react";

const columnHelper = createColumnHelper<ProjectSummary>();

export const Route = createFileRoute(
  "/_dashboard/customers/summary/$customerId/projects/"
)({
  validateSearch: projectsSearchSchema,
  loaderDeps: ({ search }) => ({
    search,
  }),
  loader({ deps: { search }, params: { customerId } }) {
    queryClient.ensureQueryData(
      trpc.basicInfo.readCustomer.queryOptions(customerId)
    );

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
  const { data: customer } = useSuspenseQuery(
    trpc.basicInfo.readCustomer.queryOptions(customerId)
  );
  const { data } = useSuspenseQuery(
    trpc.basicInfo.readCustomerProjects.queryOptions({
      customerId,
      search: deferredTableControlsReturn.deferredValues,
    })
  );

  // Temporary project columns definition
  const projectColumns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "專案名稱",
    },
    {
      accessorKey: "status",
      header: "狀態",
      cell(info) {
        return projectStatusToLabel(info.getValue() as ProjectStatus);
      },
    } as ColumnDef<ProjectSummary>,
    {
      accessorKey: "startDate",
      header: "起始日期",
    },
    {
      accessorKey: "endDate",
      header: "結束日期",
    },
    columnHelper.display({
      id: "delete-customer",
      size: 32,
      header() {
        return "";
      },
      cell(info) {
        // @ts-expect-error 'TODO replace this with a delete project dialog'
        return <DialogDeleteCustomer customer={info.row.original} />;
      },
    }),
    columnHelper.display({
      id: "view-customer",
      cell: ({ row }) => {
        const project = row.original;

        return (
          <RevealOnHover className="pr-4">
            <Link
              to="/customers/summary/$customerId/projects/$projectId"
              params={{ customerId: customerId, projectId: project.id }}
              search={{ mode: "read" }}
            >
              <LucideReceiptText className="size-4" />
            </Link>
          </RevealOnHover>
        );
      },
      size: 48,
    }),
  ];

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
            title={`${customer.name}的專案`}
            createAction={
              <Button asChild>
                <Link
                  to="/customers/summary/$customerId/projects/create"
                  params={{ customerId }}
                  key="customer-projects-page-new-project-button"
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
