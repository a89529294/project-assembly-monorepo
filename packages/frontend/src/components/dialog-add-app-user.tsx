import { DataTable } from "@/components/data-table";
import { SmartPagination } from "@/components/pagination";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { genAppUsersOrEmployeesWithSpecificDepartmentColumns } from "@/features/app-users/data-table/app-users-employees-with-specific-department";

import { trpc } from "@/trpc";
import { AppUserPermission } from "@myapp/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const DialogAddAppUser = ({
  permission,
}: {
  permission: AppUserPermission;
}) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isSuccess, isError, isFetching } = useQuery(
    trpc.personnelPermission.readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermission.queryOptions(
      {
        criteria: {
          page,
          pageSize: 20,
          departmentId: "b5d4d92c-7e8e-4b85-997e-26f546edc24d",
        },
        permission,
      }
    )
  );

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
        <div className="h-[400px] mt-4 rounded border border-gray-200">
          <ScrollArea className="h-full">
            <RenderQueryResult
              data={data}
              isLoading={isLoading}
              isSuccess={isSuccess}
              isError={isError}
              isFetching={isFetching}
            >
              {(data) => (
                <DataTable
                  columns={genAppUsersOrEmployeesWithSpecificDepartmentColumns()}
                  data={data.data}
                />
              )}
            </RenderQueryResult>
          </ScrollArea>
        </div>
        <SmartPagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={data?.totalPages ?? 0}
        />
        <DialogFooter>{/* Add actions like Save/Cancel here */}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
