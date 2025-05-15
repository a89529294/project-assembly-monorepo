import { trpc } from "@/trpc";
import { queryClient } from "@/query-client";
import { useQuery } from "@tanstack/react-query";

export function useDepartment(departmentId: string) {
  const departmentsQueryKey =
    trpc.personnelPermission.readDepartments.queryOptions().queryKey;

  const cachedDepartments = queryClient.getQueryData(departmentsQueryKey);

  const cachedDepartment = cachedDepartments
    ? cachedDepartments.find((dept) => dept.id === departmentId)
    : undefined;

  const queryOptions = trpc.personnelPermission.readDepartmentById.queryOptions(
    { departmentId }
  );

  // Use the query with placeholderData to show cached data immediately
  const { data: department, ...rest } = useQuery({
    ...queryOptions,
    placeholderData: cachedDepartment,
    enabled: !!departmentId,
  });

  return {
    department,
    ...rest,
  };
}
