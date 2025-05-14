import { DataTable } from "@/components/data-table";
import { AsyncSelect } from "@/components/inputs/async-select";
import { StaticSelect } from "@/components/inputs/static-select";
import { SmartPagination } from "@/components/pagination";
import { RenderResult } from "@/components/render-result";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { APP_USER_PERMISSION_TABS } from "@/features/app-users";

import { genAppUsersOrEmployeesWithSpecificDepartmentColumns } from "@/features/app-users/data-table/app-users-employees-with-specific-department";
import { useEmployeesOrAppUsers } from "@/hooks/app-users/use-employees-or-app-users";
import { useGrantPermission } from "@/hooks/app-users/use-grant-permission";
import { useDepartments } from "@/hooks/departments/use-departments";
import { useSelection } from "@/hooks/use-selection";

import { AppUserPermission } from "@myapp/shared";
import { useEffect, useState } from "react";

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
  const empsOrAppUsersQueryResult = useEmployeesOrAppUsers({
    page,
    departmentId,
    permissionToExclude: selectedPermission,
  });

  const {
    hasSelection,
    onSelectAllChange,
    resetSelection,
    rowSelection,
    selection,
    onSelectionChange,
  } = useSelection({
    pageIds: empsOrAppUsersQueryResult.data?.data.map((v) => v.id) ?? [],
    totalFilteredCount: empsOrAppUsersQueryResult.data?.total ?? 0,
  });

  const { grantPermission, isPending } = useGrantPermission({
    permission,
    onSuccess() {
      setOpen(false);
      resetSelection();
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

  const onSelectValueChange = ({
    type,
    value,
  }:
    | {
        type: "permission";
        value: AppUserPermission;
      }
    | {
        type: "department";
        value: string;
      }) => {
    if (type === "permission") setSelectedPermission(value);
    else setDepartmentId(value);

    resetSelection();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">新增App使用者權限</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增App使用者權限</DialogTitle>
          <div className="flex justify-between">
            <div className="flex gap-1">
              <AsyncSelect
                isLoading={isLoadingDepartments}
                onValueChange={(value) =>
                  onSelectValueChange({ type: "department", value })
                }
                value={departmentId}
                options={departmentOptions}
              />

              <StaticSelect
                value={selectedPermission}
                onValueChange={(value) =>
                  onSelectValueChange({ type: "permission", value })
                }
                options={APP_USER_PERMISSION_TABS}
              />
            </div>
            <Button
              disabled={!hasSelection || isPending}
              onClick={onGrantPermission}
            >
              確認
            </Button>
          </div>
        </DialogHeader>

        <div className="h-[400px] mt-4 rounded border border-gray-200">
          <ScrollArea className="h-full">
            <RenderResult useQueryResult={empsOrAppUsersQueryResult}>
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
            </RenderResult>
          </ScrollArea>
        </div>

        <SmartPagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={empsOrAppUsersQueryResult.data?.totalPages ?? 0}
        />
      </DialogContent>
    </Dialog>
  );
};
