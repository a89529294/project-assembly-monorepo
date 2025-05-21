import { DeleteButton } from "@/components/delete-button";
import { DialogAddUser } from "@/components/dialogs/add-user";
import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { SummaryPageDataTable } from "@/components/summary-page/summary-page-data-table";
import { SummaryPageHeader } from "@/components/summary-page/summary-page-header";
import { SummaryPageProvider } from "@/contexts/summary-page-context";
import { genUserColumns } from "@/features/users/data-table/columns";
import { useDeferredPaginatedTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { useDeleteUsers } from "@/hooks/users/use-delete-users";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { UsersSummaryQueryInputSchema } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/users"
)({
  validateSearch: UsersSummaryQueryInputSchema,
  loaderDeps: ({
    search: { orderBy, orderDirection, page, pageSize, searchTerm },
  }) => ({
    page,
    pageSize,
    orderBy,
    orderDirection,
    searchTerm,
  }),
  async loader({ deps }) {
    queryClient.ensureQueryData(
      trpc.personnelPermission.readUsers.queryOptions(deps)
    );
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const deferredTableControlsReturn = useDeferredPaginatedTableControls(search);
  const { data: usersData } = useSuspenseQuery(
    trpc.personnelPermission.readUsers.queryOptions(
      deferredTableControlsReturn.deferredValues
    )
  );

  return (
    <SummaryPageProvider
      columnsGeneratorFunction={genUserColumns}
      data={usersData}
      deferredTableControlsReturn={deferredTableControlsReturn}
      navigate={(a) => navigate({ search: a.search })}
    >
      <PageShell
        header={
          <SummaryPageHeader
            title="ERP操作權限"
            createAction={
              <DialogAddUser
                disabled={deferredTableControlsReturn.isUpdatingTableData}
              />
            }
            deleteAction={(props) => (
              <DeleteButton useDeleteHook={useDeleteUsers} hookProps={props}>
                移除ERP使用者
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
