import { CustomerForm } from "@/components/customer-form";
import { PageShell } from "@/components/layout/page-shell";
import { ScrollableBody } from "@/components/layout/scrollable-body";
import { PendingComponent } from "@/components/pending-component";
import { Button } from "@/components/ui/button";
import { useCreateCustomer } from "@/hooks/customers/use-create-customer";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/customers/create")({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { createUser, isPending } = useCreateCustomer();

  return (
    <PageShell
      header={
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">新增客戶</h1>
            <p className="text-muted-foreground">請填寫客戶資料</p>
          </div>
          <Button type="submit" form="customer-form" disabled={isPending}>
            {isPending ? "儲存中..." : "儲存"}
          </Button>
        </div>
      }
    >
      <ScrollableBody disabled={isPending}>
        <CustomerForm disabled={isPending} onSubmit={createUser} />
      </ScrollableBody>
    </PageShell>
  );
}
