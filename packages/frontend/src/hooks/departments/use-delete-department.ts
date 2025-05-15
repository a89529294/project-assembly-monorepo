import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteDepartment() {
  const { mutate: deleteDepartment, ...rest } = useMutation(
    trpc.personnelPermission.deleteDepartment.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey:
            trpc.personnelPermission.readDepartments.queryOptions().queryKey,
        });

        queryClient.removeQueries({
          queryKey: trpc.personnelPermission.readAssignedDepartments.queryKey(),
        });

        toast.success("成功刪除部門");
      },
    })
  );

  return {
    deleteDepartment,
    ...rest,
  };
}
