import { trpc } from "@/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSuspendedDepartments(searchTerm: string) {
  return useSuspenseQuery(
    trpc.personnelPermission.readDepartments.queryOptions({
      searchTerm,
    })
  );
}
