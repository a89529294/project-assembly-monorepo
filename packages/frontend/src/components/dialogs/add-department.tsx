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

import { trpc } from "@/trpc";
import { RoleName } from "@myapp/shared";
import { useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";

// TODO: add mutation to add departments to role

export const DialogAddDepartment = ({ roleName }: { roleName: RoleName }) => {
  const [open, setOpen] = useState(false);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(
    []
  );

  const { data, isFetching, isSuccess, error } = useQuery(
    trpc.personnelPermission.readUnassignedDepartments.queryOptions({
      roleName,
    })
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

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">新增部門</Button>
      </DialogTrigger>
      <DialogContent className="w-[550px]">
        <DialogHeader className="justify-between flex-row items-center">
          <DialogTitle>新增部門</DialogTitle>
          <div className="flex gap-1 mr-2">
            <Button variant="destructive" onClick={reset}>
              反選
            </Button>
            <Button onClick={() => {}}>新增</Button>
          </div>
          {/* prevent browser accessibility warning */}
          <DialogDescription className="hidden" />
        </DialogHeader>

        <div className="col-span-1 h-[400px] rounded border border-gray-200 relative">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
