import { DataTable } from "@/components/data-table";
import { AsyncSelect } from "@/components/inputs/async-select";
import { StaticSelect } from "@/components/inputs/static-select";
import { SmartPagination } from "@/components/pagination";
import { RenderQueryResult } from "@/components/render-query-result";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { genAppUsersOrEmployeesWithSpecificDepartmentColumns } from "@/features/app-users/data-table/app-users-employees-with-specific-department";
import { useEmployeesOrAppUsers } from "@/hooks/app-users/use-employees-or-app-users";
import { useGrantPermission } from "@/hooks/app-users/use-grant-permission";
import { useDepartments } from "@/hooks/departments/use-departments";
import { useSelection } from "@/hooks/use-selection";

import { AppUserPermission } from "@myapp/shared";
import { useEffect, useState } from "react";

// TODO this is the same TABS in app-machine-permissions.tsx
const TABS = [
  { key: "man-production" as const, label: "man-production" },
  { key: "ctr-gdstd" as const, label: "ctr-gdstd" },
  { key: "monitor-weight" as const, label: "monitor-weight" },
];

// TODO go over the optimization again 05/14
export const DialogAddAppUser = ({
  permission,
}: {
  permission: AppUserPermission;
}) => {
  // dialog state
  const [open, setOpen] = useState(false);

  // Form state
  const [selectedPermission, setSelectedPermission] =
    useState<AppUserPermission>(permission);
  const [page, setPage] = useState(1);

  // departments data
  const {
    departments,
    isLoading: isLoadingDepartments,
    departmentOptions,
  } = useDepartments();
  const [departmentId, setDepartmentId] = useState<string>("");

  // emps/appUsers with or without department, excluding selected permission
  const {
    data: employeesOrAppUsers,
    isLoading,
    isError,
    isFetching,
    isSuccess,
  } = useEmployeesOrAppUsers({
    page,
    departmentId,
    permissionToExclude: permission,
  });

  const {
    hasSelection,
    onSelectAllChange,
    resetSelection,
    rowSelection,
    selection,
    onSelectionChange,
  } = useSelection({
    pageIds: employeesOrAppUsers?.data.map((v) => v.id) ?? [],
    totalFilteredCount: employeesOrAppUsers?.total ?? 0,
  });

  const { grantPermission, isPending } = useGrantPermission({
    permission,
    onSuccess() {
      setOpen(false);
    },
  });

  useEffect(() => {
    if (departments) {
      setDepartmentId(departments[0].id);
    }
  }, [departments]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen) {
      setSelectedPermission(permission);
    } else {
      setPage(1);
      resetSelection();
    }
  };

  const onGrantPermission = () => {
    grantPermission({
      departmentId,
      permission: selectedPermission as AppUserPermission,
      selectionMode: selection.selectAll ? "exclude" : "include",
      deselectedIds: selection.selectAll
        ? Array.from(selection.deselectedIds)
        : undefined,
      selectedIds: selection.selectAll
        ? undefined
        : Array.from(selection.selectedIds),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">新增App使用者權限</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增App使用者權限</DialogTitle>
          <DialogDescription className="flex justify-between">
            <div className="flex gap-1">
              <AsyncSelect
                isLoading={isLoadingDepartments}
                onValueChange={setDepartmentId}
                value={departmentId}
                options={departmentOptions}
              />

              <StaticSelect
                value={selectedPermission}
                onValueChange={setSelectedPermission}
                options={TABS}
              />
            </div>
            <Button
              disabled={!hasSelection || isPending}
              onClick={onGrantPermission}
            >
              確認
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="h-[400px] mt-4 rounded border border-gray-200">
          <ScrollArea className="h-full">
            <RenderQueryResult
              data={employeesOrAppUsers}
              isLoading={isLoading}
              isSuccess={isSuccess}
              isError={isError}
              isFetching={isFetching}
            >
              {(data) => (
                <DataTable
                  columns={genAppUsersOrEmployeesWithSpecificDepartmentColumns({
                    selection,
                    onSelectAllChange: onSelectAllChange,
                  })}
                  data={data.data ? data.data : []}
                  rowSelection={rowSelection}
                  setRowSelection={onSelectionChange}
                />
              )}
            </RenderQueryResult>
          </ScrollArea>
        </div>

        <SmartPagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={employeesOrAppUsers?.totalPages ?? 0}
        />
      </DialogContent>
    </Dialog>
  );
};
