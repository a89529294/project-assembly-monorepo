import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { AppUserPermission } from "@myapp/shared";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGrantPermission({
  permission,
  onSuccess,
  onError,
}: {
  permission: AppUserPermission;
  onSuccess: () => void;
  onError?: () => void;
}) {
  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.grantEmployeeOrAppUserPermission.mutationOptions({
      onSuccess: () => {
        toast.success("成功新增App使用者權限");

        queryClient.invalidateQueries({
          queryKey: trpc.personnelPermission.readAppUserByPermission.queryKey({
            permission,
          }),
        });

        queryClient.invalidateQueries({
          queryKey:
            trpc.personnelPermission.readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermission.queryKey(),
        });

        if (onSuccess) onSuccess();
      },
      onError,
    })
  );

  return {
    grantPermission: mutate,
    isPending,
  };
}
