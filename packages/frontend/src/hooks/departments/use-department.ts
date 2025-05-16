import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export function useDepartment(departmentId?: string) {
  // Get all departments to use as a fallback
  const { data: departments } = useQuery(
    trpc.personnelPermission.readDepartments.queryOptions({
      searchTerm: "",
    })
  );

  // Find the department in the cached departments if we have it
  const cachedDepartment = departments?.find(
    (dept) => dept.id === departmentId
  );

  const { data: department, ...rest } = useQuery({
    ...trpc.personnelPermission.readDepartmentById.queryOptions({
      departmentId: departmentId!,
    }),
    initialData: cachedDepartment,
    enabled: !!departmentId,
  });

  return {
    department,
    ...rest,
  };
}
