import { PageShell } from "@/components/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { SummaryPageDataTable } from "@/components/summary-page-data-table";
import { SummaryPageHeader } from "@/components/summary-page-header";
import { SummaryPageProvider } from "@/contexts/summary-page-context";
import { genCustomerColumns } from "@/features/customers/data-table/columns";
import { useDeferredPaginatedTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { customersSummaryQueryInputSchema } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/customers/summary")({
  validateSearch: customersSummaryQueryInputSchema,
  loaderDeps: ({
    search: { orderBy, orderDirection, page, pageSize, searchTerm },
  }) => ({
    orderBy,
    orderDirection,
    page,
    pageSize,
    searchTerm,
  }),
  loader({ deps }) {
    queryClient.ensureQueryData(
      trpc.basicInfo.readCustomers.queryOptions(deps)
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

  // const navigate = Route.useNavigate();
  // const {
  //   onSelectionChange,
  //   onSelectAllChange,
  //   selection,
  //   selectedCount,
  //   rowSelection,
  // } = useSelection({
  //   totalFilteredCount: data.total,
  //   pageIds: data.data.map((e) => e.id),
  // });
  // const disableInputs = isUpdatingTableData;

  // const handleSort = (columnId: CustomerSummaryKey) => {
  //   const newSearch = handleSortChange(
  //     columnId,
  //     deferredValues.orderBy,
  //     deferredValues.orderDirection
  //   );
  //   navigate({
  //     search: newSearch,
  //     replace: true,
  //   });
  // };

  return (
    <PageShell>
      <SummaryPageProvider
        // initialSearch={search}
        data={data}
        deferredTableControlsReturn={deferredTableControlsReturn}
        columnsGeneratorFunction={genCustomerColumns}
        navigate={(a) => navigate({ search: a.search })}
      >
        <SummaryPageHeader title="客戶清單" createHref="/customers/create" />
        <SummaryPageDataTable />
        {/* <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            客戶清單
            <SearchBar
              onSearchChange={(searchTerm) => {
                navigate({
                  search: { searchTerm, page: 1 },
                  replace: true,
                });
              }}
              initSearchTerm={search.searchTerm}
              disabled={disableInputs}
              isUpdating={disableInputs}
            />
          </div>

          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal">
                  已選擇 {selectedCount} 個客戶
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {}}
                  disabled={disableInputs}
                >
                  移除客戶
                </Button>
              </div>
            )}
            <Button asChild>
              
              <Link to="/customers/create">Add Customer</Link>
            </Button>
          </div>
        </h2>
        <div className="flex-1 relative">
          <div className="absolute inset-0 bottom-10">
            <ScrollArea
              className={cn(
                "rounded-md border p-0 h-full",
                isUpdatingTableData && "opacity-50"
              )}
            >
              <DataTable
                columns={genCustomerColumns({
                  selection,
                  onSelectAllChange,
                  orderBy: search.orderBy,
                  orderDirection: search.orderDirection,
                  clickOnCurrentHeader: (columnId) => handleSort(columnId),
                  clickOnOtherHeader: (columnId) => handleSort(columnId),
                })}
                data={data.data}
                rowSelection={rowSelection}
                setRowSelection={onSelectionChange}
              />
            </ScrollArea>
          </div>
          <SmartPagination
            className="absolute bottom-0 h-10 flex items-center"
            totalPages={data.totalPages}
            currentPage={data.page}
            onPageChange={(page) => navigate({ search: { page } })}
          />
        </div> */}
      </SummaryPageProvider>
    </PageShell>
  );
}
