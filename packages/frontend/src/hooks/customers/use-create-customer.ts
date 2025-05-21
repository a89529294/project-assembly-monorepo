import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { CustomerDetail } from "@myapp/shared";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useCreateCustomer() {
  const navigate = useNavigate();
  const { mutate, ...rest } = useMutation(
    trpc.basicInfo.createCustomer.mutationOptions()
  );

  const createUser = (data: CustomerDetail) => {
    mutate(data, {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: trpc.basicInfo.readCustomers.queryKey(),
        });
        toast.success("成功新增客戶");
        navigate({ to: "/customers" });
      },
      onError(e) {
        toast.error("無法新增客戶");
        console.log(e);
      },
    });
  };

  return { createUser, ...rest };
}
