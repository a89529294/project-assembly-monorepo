import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { SummaryPageDataTable } from "@/components/summary-page/summary-page-data-table";
import { SummaryPageHeader } from "@/components/summary-page/summary-page-header";
import { Button } from "@/components/ui/button";
import { SummaryPageProvider } from "@/contexts/summary-page-context";
import { genProjectAssemblyColumns } from "@/features/assemblies/data-table/columns";
import { useDeferredPaginatedTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { ProjectAssemblyKey } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
  searchTerm: z.string().optional().default(""),
  orderBy: z.string().optional(),
  orderDirection: z.enum(["ASC", "DESC"]).optional(),
});

export const Route = createFileRoute(
  "/_dashboard/production/$customerId/$projectId"
)({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader({ deps: { search }, params: { projectId } }) {
    queryClient.ensureQueryData(
      trpc.production.readProjectAssemblies.queryOptions({
        projectId,
        pagination: {
          page: search.page,
          pageSize: search.pageSize,
          searchTerm: search.searchTerm || "",
          orderBy: (search.orderBy as ProjectAssemblyKey) || "tagId",
          orderDirection: search.orderDirection || "ASC",
        },
      })
    );

    queryClient.ensureQueryData(
      trpc.production.readSimpleProjects.queryOptions(undefined)
    );
  },
  pendingComponent: PendingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId, customerId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const deferredTableControlsReturn =
    useDeferredPaginatedTableControls<ProjectAssemblyKey>({
      page: search.page,
      pageSize: search.pageSize,
      searchTerm: search.searchTerm || "",
      orderBy: (search.orderBy as ProjectAssemblyKey) || "tagId",
      orderDirection: search.orderDirection || "ASC",
    });

  const { data: projectData } = useSuspenseQuery(
    trpc.production.readSimpleProjects.queryOptions(undefined)
  );

  const { data } = useSuspenseQuery(
    trpc.production.readProjectAssemblies.queryOptions({
      projectId,
      pagination: {
        page: deferredTableControlsReturn.deferredValues.page,
        pageSize: deferredTableControlsReturn.deferredValues.pageSize,
        searchTerm: deferredTableControlsReturn.deferredValues.searchTerm,
        orderBy: deferredTableControlsReturn.deferredValues
          .orderBy as ProjectAssemblyKey,
        orderDirection:
          deferredTableControlsReturn.deferredValues.orderDirection,
      },
    })
  );

  const project = projectData?.find((p) => p.id === projectId);

  if (!project) return null;

  return (
    <SummaryPageProvider
      data={data}
      deferredTableControlsReturn={deferredTableControlsReturn}
      columnsGeneratorFunction={genProjectAssemblyColumns}
      navigate={(a) => navigate({ search: { ...search, ...a.search } })}
    >
      <PageShell
        header={<SummaryPageHeader title={`${project.name} - 組件列表`} />}
      >
        <div className="flex justify-between mb-4">
          <Button variant="outline" asChild>
            <Link to="/production" search={{ customerId, projectId }}>
              返回專案列表
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              to="/customers/summary/$customerId/projects/$projectId"
              params={{ customerId: project?.customerId, projectId }}
            >
              專案細節
            </Link>
          </Button>
        </div>
        <SummaryPageDataTable />
      </PageShell>
    </SummaryPageProvider>
  );
}
