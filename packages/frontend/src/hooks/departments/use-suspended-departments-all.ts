import { trpc } from "@/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSuspendedDepartmentsAll() {
  return useSuspenseQuery(
    trpc.personnelPermission.readAllDepartments.queryOptions()
  );
}
