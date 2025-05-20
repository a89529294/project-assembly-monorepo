import { DialogAddDepartmentsToRole } from "@/components/dialogs/add-departments-to-role";
import { PendingComponent } from "@/components/pending-component";
import SelectionActionButtons from "@/components/selection-action-buttons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSimpleSelection } from "@/hooks/use-simple-selection";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { RoleName } from "@myapp/shared";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/basic-info/erp-permissions/roles"
)({
  loader() {
    queryClient.ensureQueryData(
      trpc.personnelPermission.readAssignedDepartments.queryOptions({
        roleName: "BasicInfoManagement",
      })
    );
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function Section({ title, roleName }: { title: string; roleName: RoleName }) {
  const { data } = useSuspenseQuery(
    trpc.personnelPermission.readAssignedDepartments.queryOptions({
      roleName,
    })
  );

  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.removeDepartmentsFromRole.mutationOptions()
  );

  const { clearAll, selected, selectedCount, toggle, isSelected } =
    useSimpleSelection(data);

  const removeDepartments = () => {
    mutate(
      {
        roleName,
        departmentIds: selected,
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
          toast.success(`成功移除部門`);
          clearAll();
        },
        onError() {
          toast.error("無法移除部門");
        },
      }
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <SelectionActionButtons
          selectedCount={selectedCount}
          isPending={isPending}
          onClear={clearAll}
          onRemove={removeDepartments}
        >
          <DialogAddDepartmentsToRole
            disabled={isPending}
            roleName={roleName}
          />
        </SelectionActionButtons>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {data.map((dept) => (
            <button key={dept.id} onClick={() => toggle(dept.id)}>
              <Card
                className={cn(
                  "transition-transform p-4",
                  isSelected(dept.id) && "scale-[1.03] border border-red-300"
                )}
              >
                <p>{dept.name}</p>
              </Card>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const sections: { title: string; roleName: RoleName }[] = [
    {
      title: "基本資料",
      roleName: "BasicInfoManagement",
    },
    {
      title: "人事權限",
      roleName: "PersonnelPermissionManagement",
    },
    {
      title: "倉庫管理",
      roleName: "StorageManagement",
    },
    {
      title: "生產管理",
      roleName: "ProductionManagement",
    },
  ];

  return (
    <div className="absolute inset-6 ">
      <ScrollArea className="h-full">
        <div className="">
          {sections.map((section, index) => (
            <Section
              key={index}
              title={section.title}
              roleName={section.roleName}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
