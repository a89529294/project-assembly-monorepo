import { DataTable } from "@/components/data-table";
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
import { departmentColumns } from "@/features/departments/data-table/columns";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";

import { trpc } from "@/trpc";
import { RoleName } from "@myapp/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { FormEventHandler, useState } from "react";
import { toast } from "sonner";

// TODO: add mutation to add departments to role

export const DialogAddDepartment = ({
  roleName,
  disabled,
}: {
  roleName: RoleName;
  disabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(
    []
  );
  const { data, isFetching, isSuccess, error } = useQuery(
    trpc.personnelPermission.readUnassignedDepartments.queryOptions({
      roleName,
    })
  );
  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.addDepartmentsToRole.mutationOptions()
  );

  const onRowSelect = (id: string) => {
    setSelectedDepartmentIds((prev) => {
      let newIds = [...prev];
      if (prev.includes(id)) newIds = prev.filter((prevId) => prevId !== id);
      else newIds.push(id);
      return newIds;
    });
  };

  const reset = () => {
    setSelectedDepartmentIds([]);
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    mutate(
      {
        roleName,
        departmentIds: selectedDepartmentIds,
      },
      {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey:
              trpc.personnelPermission.readUnassignedDepartments.queryKey({
                roleName,
              }),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.personnelPermission.readAssignedDepartments.queryKey(
              { roleName }
            ),
          });
          toast.success(`成功新增部門到 ${roleName}`);
          reset();
          setOpen(false);
        },
        onError() {
          toast.error(`無法新增部門到 ${roleName}`);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        reset();
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="outline">
          新增部門
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[550px]">
        <DialogHeader className="justify-between flex-row items-center">
          <DialogTitle>新增部門</DialogTitle>
          <div className="flex gap-1 mr-2">
            <Button
              type="button"
              variant="destructive"
              onClick={reset}
              disabled={isPending || selectedDepartmentIds.length === 0}
            >
              反選
            </Button>
            <Button
              type="submit"
              form="role-department-form"
              disabled={isPending || selectedDepartmentIds.length === 0}
            >
              新增
            </Button>
          </div>
          {/* prevent browser accessibility warning */}
          <DialogDescription className="hidden" />
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          id="role-department-form"
          className="col-span-1 h-[400px] rounded border border-gray-200 relative"
        >
          <div className="absolute inset-0">
            <ScrollArea
              className={cn("w-full h-full", isFetching && "opacity-50")}
            >
              {isSuccess ? (
                <DataTable
                  columns={departmentColumns}
                  data={data}
                  onRowSelect={onRowSelect}
                  selectedRows={selectedDepartmentIds}
                />
              ) : error instanceof TRPCClientError ? (
                <pre>
                  {JSON.stringify(
                    {
                      message: error.shape.message,
                      code: error.data.code,
                    },
                    null,
                    2
                  )}
                </pre>
              ) : (
                "未知問題"
              )}
            </ScrollArea>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
