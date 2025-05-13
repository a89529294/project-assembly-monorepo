import DialogEnableUserDepartmentPermission from "@/components/dialogs/enable-user-department-permission";
import { PendingComponent } from "@/components/pending-component";
import { RenderQueryResult } from "@/components/render-query-result";
import SelectionActionButtons from "@/components/selection-action-buttons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSuspendedDepartments } from "@/hooks/departments/use-suspended-departments";
import { useSimpleSelection } from "@/hooks/use-simple-selection";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { DepartmentSummary } from "@myapp/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  const { data: departments } = useSuspendedDepartments();

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

  const {
    data: users,
    isSuccess,
    isError,
    isFetching,
    isLoading,
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
  const { selected, clearAll, toggle, isSelected } = useSimpleSelection(users);

  const removeUsersFromDepartment = () => {
    mutate(
      {
        selection: { selectedIds: selected },
        departmentId: department.id,
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
          clearAll();
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
            <SelectionActionButtons
              hasSelection={selected.length > 0}
              isPending={isPending}
              onClear={clearAll}
              onRemove={removeUsersFromDepartment}
            >
              <DialogEnableUserDepartmentPermission
                departmentId={department.id}
                disabled={isPending}
              />
            </SelectionActionButtons>
          </div>
          <div className="grid grid-cols-2 gap-3 relative min-h-10">
            <RenderQueryResult
              data={users}
              isSuccess={isSuccess}
              isError={isError}
              isFetching={isFetching}
              isLoading={isLoading}
            >
              {(users) =>
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggle(user.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 bg-gray-50 rounded-md border hover:shadow-sm transition",
                      isSelected(user.id) && "scale-[1.01] border-red-300"
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
