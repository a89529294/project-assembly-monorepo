import { trpc } from "@/trpc";
import { PaginatedDepartmentSummaryQueryInput } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSuspendedDepartmentsPaginated(
  search: PaginatedDepartmentSummaryQueryInput
) {
  return useSuspenseQuery(
    trpc.personnelPermission.readPaginatedDepartments.queryOptions(search)
  );
}
