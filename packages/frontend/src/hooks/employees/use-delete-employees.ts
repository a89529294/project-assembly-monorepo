import { SelectionStateData } from "@/hooks/use-selection";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteEmployees({
  selectionData,
  resetSelection,
}: {
  selectionData: SelectionStateData;
  resetSelection: () => void;
}) {
  const { mutate, isPending } = useMutation(
    trpc.basicInfo.deleteEmployees.mutationOptions()
  );

  const onDeleteEmployees = () => {
    const config = {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: trpc.basicInfo.readEmployees.queryKey(),
        });
        toast.success("成功移除員工");
        resetSelection();
      },
      onError() {
        toast.error("無法移除員工");
      },
    };

    mutate(selectionData, config);
  };

  return { onDelete: onDeleteEmployees, isPending };
}
