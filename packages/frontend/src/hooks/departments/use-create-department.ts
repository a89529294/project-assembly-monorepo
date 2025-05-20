import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateDepartment() {
  const { mutate: createDepartment, ...rest } = useMutation(
    trpc.personnelPermission.createDepartment.mutationOptions({
      onSuccess() {
        toast.success("成功新增部門");
        queryClient.invalidateQueries({
          queryKey:
            trpc.personnelPermission.readAllDepartments.queryOptions().queryKey,
        });
      },
    })
  );

  return {
    createDepartment,
    ...rest,
  };
}
