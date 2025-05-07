import { DialogAddDepartment } from "@/components/dialogs/add-department";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { RoleName } from "@myapp/shared";

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
  pendingComponent: () => <div>Loading...</div>,
});

function Section({ title, roleName }: { title: string; roleName: RoleName }) {
  const { data } = useSuspenseQuery(
    trpc.personnelPermission.readAssignedDepartments.queryOptions({
      roleName,
    })
  );

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <DialogAddDepartment roleName={roleName} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {data.map((dept) => (
            <Card key={dept.id} className="p-4">
              <p>{dept.name}</p>
            </Card>
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
