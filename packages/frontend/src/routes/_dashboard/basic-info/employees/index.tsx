import { PageShell } from "@/components/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { SummaryPageDataTable } from "@/components/summary-page-data-table";
import { SummaryPageHeader } from "@/components/summary-page-header";
import { SummaryPageProvider } from "@/contexts/summary-page-context";
import { genEmployeeColumns } from "@/features/employees/data-table/columns";
import { useDeferredPaginatedTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { employeesSummaryQueryInputSchema } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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
    <PageShell>
      <SummaryPageProvider
        // initialSearch={search}
        // data={data}
        // columnsGeneratorFunction={genEmployeeColumns}
        // navigate={(a) => navigate({ search: a.search })}
        // initialSearch={search}
        data={data}
        deferredTableControlsReturn={deferredTableControlsReturn}
        columnsGeneratorFunction={genEmployeeColumns}
        navigate={(a) => navigate({ search: a.search })}
      >
        <SummaryPageHeader
          title="客戶清單"
          createHref="//basic-info/employees/create"
        />
        <SummaryPageDataTable />
      </SummaryPageProvider>
    </PageShell>
  );

  // const { page, pageSize, orderBy, orderDirection, searchTerm } =
  //   Route.useSearch();
  // const navigate = Route.useNavigate();

  // const { deferredValues, isUpdatingTableData, handleSortChange } =
  //   useDeferredTableControls({
  //     page,
  //     pageSize,
  //     orderBy,
  //     orderDirection,
  //     searchTerm,
  //   });

  // const { data: employees } = useSuspenseQuery(
  //   trpc.basicInfo.readEmployees.queryOptions(deferredValues)
  // );
  // const {
  //   onSelectionChange,
  //   onSelectAllChange,
  //   selection,
  //   selectedCount,
  //   rowSelection,
  //   resetSelection,
  //   data: selectedUsers,
  // } = useSelection({
  //   totalFilteredCount: employees.total,
  //   pageIds: employees.data.map((e) => e.id),
  // });
  // const { mutate, isPending } = useMutation(
  //   trpc.basicInfo.deleteEmployees.mutationOptions()
  // );

  // const disableInputs = isPending || isUpdatingTableData;

  // const onDeleteEmployees = () => {
  //   mutate(selectedUsers, {
  //     onSuccess() {
  //       toast.success("成功移除員工");

  //       queryClient.invalidateQueries({
  //         queryKey: trpc.basicInfo.readEmployees.queryKey(),
  //       });

  //       resetSelection();
  //     },
  //     onError() {
  //       toast.error("無法移除員工");
  //     },
  //   });
  // };

  // // Define the valid column IDs based on the employee summary schema
  // type EmployeeColumnId = keyof EmployeeSummary & string;

  // const handleSort = (columnId: EmployeeColumnId) => {
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

  // return (
  //   <PageShell>
  //     <h2 className="text-xl font-bold mb-4 flex justify-between">
  //       <div className="flex gap-3 items-center">
  //         員工清單
  //         <SearchBar
  //           onSearchChange={(searchTerm) => {
  //             navigate({
  //               search: { searchTerm },
  //               replace: true,
  //             });
  //             resetSelection();
  //           }}
  //           initSearchTerm={searchTerm}
  //           disabled={disableInputs}
  //           isUpdating={isUpdatingTableData}
  //         />
  //       </div>

  //       <div className="flex items-center gap-3">
  //         {selectedCount > 0 && (
  //           <div className="flex items-center gap-2">
  //             <span className="text-sm font-normal">
  //               已選擇 {selectedCount} 個使用者
  //             </span>
  //             <Button
  //               variant="destructive"
  //               size="sm"
  //               onClick={onDeleteEmployees}
  //               disabled={disableInputs}
  //             >
  //               移除員工員工
  //             </Button>
  //           </div>
  //         )}
  //         <Button asChild disabled={disableInputs}>
  //           <Link to="/basic-info/employees/create">新增員工</Link>
  //         </Button>
  //       </div>
  //     </h2>
  //     <div className="flex-1 relative">
  //       <div className="absolute inset-0 bottom-10">
  //         <ScrollArea
  //           className={cn(
  //             "rounded-md border p-0 h-full",
  //             disableInputs && "opacity-50"
  //           )}
  //         >
  //           <DataTable
  //             columns={genEmployeeColumns({
  //               selection,
  //               onSelectAllChange,
  //               orderBy,
  //               orderDirection,
  //               clickOnCurrentHeader: (columnId: EmployeeColumnId) =>
  //                 handleSort(columnId),
  //               clickOnOtherHeader: (columnId: EmployeeColumnId) =>
  //                 handleSort(columnId),
  //             })}
  //             data={employees.data}
  //             rowSelection={rowSelection}
  //             setRowSelection={onSelectionChange}
  //           />
  //         </ScrollArea>
  //       </div>
  //       <SmartPagination
  //         className="absolute bottom-0 h-10 flex items-center"
  //         totalPages={employees.totalPages}
  //         currentPage={deferredValues.page}
  //         onPageChange={(newPage) =>
  //           navigate({
  //             to: "/basic-info/employees",
  //             search: {
  //               ...deferredValues,
  //               page: newPage,
  //             },
  //             replace: true,
  //           })
  //         }
  //       />
  //     </div>
  //   </PageShell>
  // );
}
