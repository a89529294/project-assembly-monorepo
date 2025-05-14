import { DataTable } from "@/components/data-table";
import { RenderResult } from "@/components/render-result";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { genUserColumns } from "@/features/users/data-table/columns";
import { useSelection } from "@/hooks/use-selection";
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
  const [orderBy, setOrderBy] = useState<UserSummaryKey>("account");
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("DESC");
  const departmentUsersQuery = useQuery(
    trpc.personnelPermission.readDepartmentUsers.queryOptions({
      departmentId,
      inheritsDepartmentRoles: false,
    })
  );
  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.updateUserDepartmentRelation.mutationOptions()
  );
  const {
    onSelectionChange,
    onSelectAllChange,
    selection,
    rowSelection,
    resetSelection,
    data: selectedUsers,
  } = useSelection({
    totalFilteredCount: departmentUsersQuery.data?.length ?? 0,
    pageIds: departmentUsersQuery.data?.map((user) => user.id) ?? [],
  });

  const onConfirm = () => {
    mutate(
      {
        selection: selectedUsers,
        departmentId,
        inheritsDepartmentRoles: true,
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
        resetSelection();
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
          <RenderResult useQueryResult={departmentUsersQuery}>
            {(data) => (
              <DataTable
                columns={genUserColumns({
                  selection,
                  onSelectAllChange,
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
                rowSelection={rowSelection}
                setRowSelection={onSelectionChange}
              />
            )}
          </RenderResult>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            取消
          </Button>
          <Button disabled={isPending} onClick={onConfirm}>
            確認
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogEnableUserDepartmentPermission;
