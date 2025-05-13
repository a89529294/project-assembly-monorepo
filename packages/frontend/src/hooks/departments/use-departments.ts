import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export function useDepartments() {
  const { data: departments, ...rest } = useQuery(
    trpc.personnelPermission.readDepartments.queryOptions()
  );
  const departmentOptions = departments
    ? [
        ...departments.map((v) => ({ key: v.id, label: v.name })),
        { key: "no-department", label: "無部門" },
      ]
    : undefined;

  return {
    departments,
    ...rest,
    departmentOptions,
  };
}
