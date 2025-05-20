import { CustomerForm } from "@/components/customer-form";
import { PageShell } from "@/components/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc";
import { CustomerDetail } from "@myapp/shared";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/customers/create")({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { mutate, isPending } = useMutation(
    trpc.basicInfo.createCustomer.mutationOptions()
  );
  // const createCustomer = trpc.customers.create.useMutation({
  //   onSuccess: () => {
  //     toast.success("客戶建立成功");
  //     queryClient.invalidateQueries({
  //       queryKey: ["customers", "list"],
  //     });
  //     navigate({ to: "/customers/summary" });
  //   },
  // });

  async function onSubmit(data: CustomerDetail) {
    console.log(data);
    mutate(data);
  }

  return (
    <PageShell>
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">新增客戶</h1>
          <p className="text-muted-foreground">請填寫客戶資料</p>
        </div>
        <Button type="submit" form="customer-form" disabled={isPending}>
          {isPending ? "儲存中..." : "儲存"}
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <CustomerForm disabled={isPending} onSubmit={onSubmit} />
      </div>
    </PageShell>
  );
}
