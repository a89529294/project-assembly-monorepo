import { SelectionStateData } from "@/hooks/use-selection";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteUsers({
  selectionData,
  resetSelection,
}: {
  selectionData: SelectionStateData;
  resetSelection: () => void;
}) {
  const { mutate, isPending } = useMutation(
    trpc.personnelPermission.deleteUsers.mutationOptions()
  );

  const onDeleteUsers = () => {
    const config = {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: trpc.personnelPermission.readUsers.queryKey(),
        });
        toast.success("成功移除ERP使用者");
        resetSelection();
      },
      onError() {
        toast.error("無法移除erp使用者");
      },
    };

    mutate(selectionData, config);
  };

  return { onDelete: onDeleteUsers, isPending };
}
