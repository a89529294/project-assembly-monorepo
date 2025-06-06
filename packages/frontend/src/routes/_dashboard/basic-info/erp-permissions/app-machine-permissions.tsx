import { DataTable } from "@/components/data-table";
import { DialogAddAppUser } from "@/components/dialog-add-app-user";
import { PageShell } from "@/components/layout/page-shell";
import { ScrollableBody } from "@/components/layout/scrollable-body";
import { PendingComponent } from "@/components/pending-component";
import { SearchActionHeader } from "@/components/search-action-header";
import { SearchBarImperativeHandle } from "@/components/search-bar";
import SelectionActionButtons from "@/components/selection-action-buttons";
import { APP_USER_PERMISSION_TABS } from "@/features/app-users";

import { genAppUsersWithAllDepartmentsColumns } from "@/features/app-users/data-table/app-users-with-all-departments";
import { useDeferredAppPermissionControls } from "@/hooks/use-deferred-app-permission-controls";
import { useSimpleSelection } from "@/hooks/use-simple-selection";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import {
  AppUserPermission,
  getAppUsersByPermissionInputSchema,
} from "@myapp/shared";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/app-machine-permissions"
)({
  validateSearch: getAppUsersByPermissionInputSchema,
  loaderDeps: ({ search: { permission, searchTerm } }) => ({
    permission,
    searchTerm,
  }),
  loader: async ({ deps: { permission, searchTerm } }) => {
    queryClient.ensureQueryData(
      trpc.personnelPermission.readAppUserByPermission.queryOptions({
        permission,
        searchTerm,
      })
    );
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

export function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const {
    deferredValues: { permission, searchTerm },
    isUpdating,
  } = useDeferredAppPermissionControls(search);
  const { data } = useSuspenseQuery(
    trpc.personnelPermission.readAppUserByPermission.queryOptions({
      permission,
      searchTerm,
    })
  );

  const ref = useRef<SearchBarImperativeHandle>(null);
  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.deleteAppUsersPermission.mutationOptions()
  );
  const { rowSelection, setRowSelection, clearAll, selected } =
    useSimpleSelection(data);

  const onRemoveAppUsersPermission = () => {
    mutate(
      {
        appUserIds: selected,
        permission,
      },
      {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey: trpc.personnelPermission.readAppUserByPermission.queryKey(
              {
                permission,
              }
            ),
          });
          clearAll();
        },
        onError() {},
      }
    );
  };

  const onSwitchPermission = (permission: AppUserPermission) => {
    navigate({ search: { permission, searchTerm: "" } });
    ref.current!.resetInput();
    clearAll();
  };

  const disableInputs = isUpdating || isPending;

  return (
    <PageShell
      header={
        <SearchActionHeader
          title="App/機台操作權限"
          disableInputs={disableInputs}
          initSearchTerm={searchTerm}
          isSearching={isUpdating}
          onSearchChange={(s) =>
            navigate({ search: { searchTerm: s, permission } })
          }
        >
          <SelectionActionButtons
            selectedCount={selected.length}
            isPending={disableInputs}
            onClear={clearAll}
            onRemove={onRemoveAppUsersPermission}
          >
            <DialogAddAppUser permission={permission} />
          </SelectionActionButtons>
        </SearchActionHeader>
      }
    >
      <div className="flex border-b border-gray-200 mb-4">
        {APP_USER_PERMISSION_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onSwitchPermission(t.key)}
            className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 focus:outline-none ${
              permission === t.key
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-700 hover:text-blue-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ScrollableBody border disabled={isUpdating}>
        <DataTable
          columns={genAppUsersWithAllDepartmentsColumns()}
          data={data}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </ScrollableBody>
    </PageShell>
  );
}
