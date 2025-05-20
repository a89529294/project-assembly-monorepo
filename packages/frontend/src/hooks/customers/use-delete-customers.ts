import { SelectionStateData } from "@/hooks/use-selection";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteCustomers({
  selectionData,
  onSuccess,
}: {
  selectionData: SelectionStateData;
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useMutation(
    trpc.basicInfo.deleteCustomers.mutationOptions()
  );

  const onDeleteUsers = () => {
    const config = {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: trpc.basicInfo.readCustomers.queryKey(),
        });
        toast.success("成功移除客戶");
        if (onSuccess) onSuccess();
      },
      onError() {
        toast.error("無法移除客戶");
      },
    };

    mutate(selectionData, config);
  };

  return { onDelete: onDeleteUsers, isPending };
}
