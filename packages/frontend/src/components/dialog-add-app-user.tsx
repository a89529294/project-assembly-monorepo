import { DataTable } from "@/components/data-table";
import { SmartPagination } from "@/components/pagination";
import { RenderQueryResult } from "@/components/render-query-result";
import { Spinner } from "@/components/spinner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { genAppUsersOrEmployeesWithSpecificDepartmentColumns } from "@/features/app-users/data-table/app-users-employees-with-specific-department";
import { useSelection } from "@/hooks/use-selection";
import { queryClient } from "@/query-client";

import { trpc } from "@/trpc";
import { AppUserPermission } from "@myapp/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// TODO this is the same TABS in app-machine-permissions.tsx
const TABS = [
  { key: "man-production" as const, label: "man-production" },
  { key: "ctr-gdstd" as const, label: "ctr-gdstd" },
  { key: "monitor-weight" as const, label: "monitor-weight" },
];

export const DialogAddAppUser = ({
  permission,
}: {
  permission: AppUserPermission;
}) => {
  const [open, setOpen] = useState(false);
  const { data: departments, isLoading: isLoadingDepartments } = useQuery(
    trpc.personnelPermission.readDepartments.queryOptions(undefined, {})
  );
  const [departmentId, setDepartmentId] = useState<string>("");
  const [selectedPermission, setSelectedPermission] =
    useState<AppUserPermission>(permission);
  const [page, setPage] = useState(1);
  const {
    data: employeesOrAppUsers,
    isLoading,
    isSuccess,
    isError,
    isFetching,
  } = useQuery(
    trpc.personnelPermission.readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermission.queryOptions(
      {
        criteria: {
          page,
          pageSize: 20,
          departmentId: departmentId!,
        },
        permission: selectedPermission,
      },
      {
        enabled: !!departmentId,
      }
    )
  );
  const {
    rowSelection,
    onSelectionChange,
    selection,
    onSelectAllChange,
    hasSelection,
    resetSelection,
  } = useSelection({
    pageIds: employeesOrAppUsers?.data.map((v) => v.id) ?? [],
    totalFilteredCount: employeesOrAppUsers?.total ?? 0,
  });
  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.grantEmployeeOrAppUserPermission.mutationOptions()
  );

  useEffect(() => {
    if (departments) {
      setDepartmentId(departments[0].id);
    }
  }, [departments]);

  useEffect(() => {
    if (open) {
      setSelectedPermission(permission);
    }
    if (!open) {
      setPage(1);
      resetSelection();
    }
  }, [open, resetSelection, permission]);

  const onGrantPermission = () => {
    mutate(
      {
        departmentId,
        permission: selectedPermission as AppUserPermission,
        selectionMode: selection.selectAll ? "exclude" : "include",
        deselectedIds: selection.selectAll
          ? Array.from(selection.deselectedIds)
          : undefined,
        selectedIds: selection.selectAll
          ? undefined
          : Array.from(selection.selectedIds),
      },
      {
        onSuccess() {
          toast.success("成功新增App使用者權限");
          queryClient.invalidateQueries({
            queryKey: trpc.personnelPermission.readAppUserByPermission.queryKey(
              {
                permission,
              }
            ),
          });
          queryClient.invalidateQueries({
            queryKey:
              trpc.personnelPermission.readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermission.queryKey(),
          });
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">新增App使用者權限</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增App使用者權限</DialogTitle>
          <DialogDescription className="flex justify-between">
            <div className="flex gap-1">
              <Select onValueChange={setDepartmentId} value={departmentId}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="請選擇部門" />
                </SelectTrigger>

                <SelectContent className="w-[--radix-select-trigger-width]">
                  {isLoadingDepartments ? (
                    <SelectItem
                      className="flex justify-center"
                      key="loading"
                      value="loading"
                      disabled
                    >
                      <Spinner className="mx-0 text-black relative left-3" />
                    </SelectItem>
                  ) : departments ? (
                    [
                      ...departments.map((op) => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.name}
                        </SelectItem>
                      )),
                      <SelectItem key={"no-department"} value={"no-department"}>
                        無部門
                      </SelectItem>,
                    ]
                  ) : (
                    <SelectItem key="no-options" value="no-options" disabled>
                      無選項
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(v) =>
                  setSelectedPermission(v as AppUserPermission)
                }
                value={selectedPermission}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="請選擇權限" />
                </SelectTrigger>

                <SelectContent className="w-[--radix-select-trigger-width]">
                  {TABS.map((op) => (
                    <SelectItem key={op.key} value={op.key}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={!hasSelection || isPending}
              onClick={onGrantPermission}
            >
              確認
            </Button>
          </DialogDescription>
        </DialogHeader>
        {/* App Users List */}
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
                    onSelectAllChange,
                  })}
                  data={data.data}
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
