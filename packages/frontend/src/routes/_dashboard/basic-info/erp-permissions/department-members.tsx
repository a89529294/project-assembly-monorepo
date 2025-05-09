import DialogEnableUserDepartmentPermission from "@/components/dialogs/enable-user-department-permission";
import { PendingComponent } from "@/components/pending-component";
import { RenderQueryResult } from "@/components/render-query-result";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { DepartmentSummary } from "@myapp/shared";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/department-members"
)({
  loader() {
    queryClient.ensureQueryData(
      trpc.personnelPermission.readDepartments.queryOptions()
    );
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { data: departments } = useSuspenseQuery(
    trpc.personnelPermission.readDepartments.queryOptions()
  );

  return (
    <div className="absolute inset-6">
      <ScrollArea className="h-full">
        <div>
          {departments.map((dept) => (
            <DepartmentSection key={dept.id} department={dept} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function DepartmentSection({ department }: { department: DepartmentSummary }) {
  const [open, setOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const {
    data: users,
    isSuccess,
    isError,
  } = useQuery(
    trpc.personnelPermission.readDepartmentUsers.queryOptions(
      {
        departmentId: department.id,
        inheritsDepartmentRoles: true,
      },
      {
        enabled: open,
      }
    )
  );
  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.updateUserDepartmentRelation.mutationOptions()
  );

  const toggleSelectUser = (userId: string) =>
    setSelectedUserIds((prev) =>
      selectedUserIds.includes(userId)
        ? prev.filter((pid) => pid !== userId)
        : [...prev, userId]
    );

  const removeUsersFromDepartment = () => {
    mutate(
      {
        departmentId: department.id,
        userIds: selectedUserIds,
        inheritsDepartmentRoles: false,
      },
      {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey: trpc.personnelPermission.readDepartmentUsers.queryKey({
              departmentId: department.id,
            }),
          });
          toast.success(`成功從${department.name}移除使用者`);
          setSelectedUserIds([]);
        },
        onError() {
          toast.error(`無法從${department.name}移除使用者`);
        },
      }
    );
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      defaultOpen={false}
      className="mb-4 border rounded-lg bg-white shadow-sm"
    >
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors rounded-t-lg">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <ChevronRight
              className={cn(
                "w-5 h-5 transition-transform",
                open && "rotate-90"
              )}
            />
            {department.name}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-6 pb-4 pt-2 flex flex-col gap-2">
          <div className="flex justify-end">
            <div className="flex gap-1">
              {selectedUserIds.length > 0 && (
                <>
                  <Button
                    variant={"secondary"}
                    onClick={() => setSelectedUserIds([])}
                    disabled={isPending}
                  >
                    反選
                  </Button>
                  <Button
                    variant={"destructive"}
                    onClick={removeUsersFromDepartment}
                    disabled={isPending}
                  >
                    移除使用者
                  </Button>
                </>
              )}
              <DialogEnableUserDepartmentPermission
                departmentId={department.id}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 relative min-h-10">
            <RenderQueryResult
              data={users}
              isSuccess={isSuccess}
              isError={isError}
            >
              {(users) =>
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleSelectUser(user.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 bg-gray-50 rounded-md border hover:shadow-sm transition",
                      selectedUserIds.includes(user.id) &&
                        "scale-[1.01] border-red-300"
                    )}
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{user.name}</span>
                  </button>
                ))
              }
            </RenderQueryResult>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
