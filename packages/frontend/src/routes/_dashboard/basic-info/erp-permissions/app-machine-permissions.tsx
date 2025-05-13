import { DataTable } from "@/components/data-table";
import { DialogAddAppUser } from "@/components/dialog-add-app-user";
import { PendingComponent } from "@/components/pending-component";
import SelectionActionButtons from "@/components/selection-action-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";

import { genAppUsersWithAllDepartmentsColumns } from "@/features/app-users/data-table/app-users-with-all-departments";
import { useSimpleSelection } from "@/hooks/use-simple-selection";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { AppUserPermission, appUserPermissionEnum } from "@myapp/shared";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue } from "react";
import { z } from "zod";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/app-machine-permissions"
)({
  validateSearch: z.object({
    permission: appUserPermissionEnum.default("man-production"),
  }),
  loaderDeps: ({ search: { permission } }) => ({
    permission,
  }),
  loader: async ({ deps: { permission } }) => {
    queryClient.ensureQueryData(
      trpc.personnelPermission.readAppUserByPermission.queryOptions({
        permission: permission,
      })
    );
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

export function RouteComponent() {
  const TABS = [
    { key: "man-production" as const, label: "man-production" },
    { key: "ctr-gdstd" as const, label: "ctr-gdstd" },
    { key: "monitor-weight" as const, label: "monitor-weight" },
  ];
  const { permission } = Route.useSearch();
  const navigate = Route.useNavigate();
  const deferredPermission = useDeferredValue(permission);
  const loading = permission !== deferredPermission;

  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.deleteAppUsersPermission.mutationOptions()
  );

  const { data } = useSuspenseQuery(
    trpc.personnelPermission.readAppUserByPermission.queryOptions({
      permission: deferredPermission,
    })
  );
  const {
    rowSelection,
    setRowSelection,
    isPartialSelected,
    clearAll,
    selected,
  } = useSimpleSelection(data);

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
    navigate({ search: { permission } });
    clearAll();
  };

  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-lg h-full">
      <div className="flex justify-end mb-6">
        <SelectionActionButtons
          hasSelection={isPartialSelected}
          isPending={isPending}
          onClear={clearAll}
          onRemove={onRemoveAppUsersPermission}
        >
          <DialogAddAppUser permission={permission} />
        </SelectionActionButtons>
      </div>
      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map((t) => (
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
      <div className="grow relative">
        <div className="absolute inset-0 ">
          <ScrollArea
            className={cn(
              "rounded-md border p-0 h-full",
              loading && "opacity-50"
            )}
          >
            <DataTable
              columns={genAppUsersWithAllDepartmentsColumns()}
              data={data}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
