import { DataTable } from "@/components/data-table";
import { RenderQueryResult } from "@/components/render-query-result";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { genUserColumns } from "@/features/users/data-table/columns";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { OrderDirection, UserSummaryKey } from "@myapp/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const DialogEnableUserDepartmentPermission = ({
  departmentId,
  disabled,
}: {
  departmentId: string;
  disabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<UserSummaryKey>("account");
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("DESC");
  const {
    data: users,
    isSuccess,
    isError,
  } = useQuery(
    trpc.personnelPermission.readDepartmentUsers.queryOptions({
      departmentId,
      valid: false,
    })
  );
  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.updateUserDepartmentRelation.mutationOptions()
  );

  const onRowSelect = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const reset = () => {
    setSelectedUserIds([]);
  };

  const onConfirm = () => {
    mutate(
      {
        userIds: selectedUserIds,
        departmentId,
        valid: true,
      },
      {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey: trpc.personnelPermission.readDepartmentUsers.queryKey({
              departmentId,
            }),
          });
          toast.success("成功新增使用者部門");
          setOpen(false);
        },
        onError() {
          toast.error("無法新增使用者部門");
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
        <Button variant="outline" disabled={disabled}>
          新增使用者
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[420px]">
        <DialogHeader>
          <DialogTitle>選擇使用者</DialogTitle>
        </DialogHeader>
        <div className="h-[320px] mt-4 border rounded overflow-auto p-1 relative">
          <RenderQueryResult
            data={users}
            isSuccess={isSuccess}
            isError={isError}
          >
            {(data) => (
              <DataTable
                columns={genUserColumns({
                  orderBy,
                  orderDirection,
                  clickOnCurrentHeader() {
                    setOrderDirection((prev) =>
                      prev === "ASC" ? "DESC" : "ASC"
                    );
                  },
                  clickOnOtherHeader(s) {
                    setOrderBy(s);
                    setOrderDirection("DESC");
                  },
                  hideColumns: ["password"],
                })}
                data={data}
                onRowSelect={onRowSelect}
                selectedRows={selectedUserIds}
              />
            )}
          </RenderQueryResult>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            取消
          </Button>
          <Button
            disabled={selectedUserIds.length === 0 || isPending}
            onClick={onConfirm}
          >
            確認
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogEnableUserDepartmentPermission;
