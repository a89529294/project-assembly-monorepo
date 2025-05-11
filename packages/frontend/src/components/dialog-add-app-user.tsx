import { DataTable } from "@/components/data-table";
import { RenderQueryResult } from "@/components/render-query-result";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { genAppUsersOrEmployeesColumns } from "@/features/app-users/data-table/columns";
import { trpc } from "@/trpc";
import { AppUserPermission } from "@myapp/shared";
import { useQuery } from "@tanstack/react-query";

export const DialogAddAppUser = ({
  permission,
}: {
  permission: AppUserPermission;
}) => {
  const { data, isLoading, isSuccess, isError } = useQuery(
    trpc.personnelPermission.readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermission.queryOptions(
      {
        criteria: {
          page: 1,
          pageSize: 10,
          orderBy: "employee.idNumber",
          orderDirection: "DESC",
          searchTerm: "",
        },
        permission,
      }
    )
  );

  console.log(data);

  // State for selected user
  // const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
  //   null
  // );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">新增員工</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增員工</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new app user. (Placeholder for form)
          </DialogDescription>
        </DialogHeader>
        {/* App Users List */}
        <div
          className="max-h-[400px] mt-4 rounded border border-gray-200"
          style={{
            overflowY: data && data.total > 10 ? "auto" : "visible",
          }}
        >
          {/* <RenderQueryResult
            data={data}
            isLoading={isLoading}
            isSuccess={isSuccess}
            isError={isError}
          >
            {(data) => (
              <DataTable
                columns={genAppUsersOrEmployeesColumns()}
                data={data.data}
              />
            )}
          </RenderQueryResult> */}
        </div>

        <DialogFooter>{/* Add actions like Save/Cancel here */}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
