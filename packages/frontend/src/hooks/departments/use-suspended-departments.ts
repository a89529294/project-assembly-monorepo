import { trpc } from "@/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSuspendedDepartments() {
  return useSuspenseQuery(
    trpc.personnelPermission.readDepartments.queryOptions()
  );
}
