import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export function useUpdateCustomer() {
  const { mutate, ...rest } = useMutation(
    trpc.basicInfo.updateCustomer.mutationOptions()
  );

  return { updateCustomer: mutate, ...rest };
}
