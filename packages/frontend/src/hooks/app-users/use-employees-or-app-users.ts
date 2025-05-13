import { trpc } from "@/trpc";
import { AppUserPermission } from "@myapp/shared";
import { useQuery } from "@tanstack/react-query";

export function useEmployeesOrAppUsers({
  page,
  departmentId,
  permissionToExclude,
}: {
  page: number;
  departmentId: string;
  permissionToExclude: AppUserPermission;
}) {
  const result = useQuery(
    trpc.personnelPermission.readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermission.queryOptions(
      {
        criteria: {
          page,
          pageSize: 20,
          departmentId: departmentId!,
        },
        permissionToExclude,
      },
      {
        enabled: !!departmentId,
      }
    )
  );

  return result;
}
