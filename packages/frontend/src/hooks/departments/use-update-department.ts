import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateDepartment(departmentId: string) {
  const { mutate: updateDepartment, ...rest } = useMutation(
    trpc.personnelPermission.updateDepartment.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: trpc.personnelPermission.readAllDepartments.queryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.personnelPermission.readDepartmentById.queryOptions({
            departmentId,
          }).queryKey,
        });

        toast.success("成功更新部門");
      },

      onError(error) {
        console.log(error);
        toast.error("無法更新部門");
      },
    })
  );

  return {
    updateDepartment,
    ...rest,
  };
}
