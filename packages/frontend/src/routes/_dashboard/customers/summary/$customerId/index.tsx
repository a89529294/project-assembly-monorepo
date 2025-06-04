import { useRef } from "react";
import { CustomerForm, CustomerFormRef } from "@/components/customer-form";
import { PageShell } from "@/components/layout/page-shell";
import { ScrollableBody } from "@/components/layout/scrollable-body";
import { PendingComponent } from "@/components/pending-component";
import { Button } from "@/components/ui/button";
import { useSuspenseCustomer } from "@/hooks/customers/use-suspense-customer";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { CustomerDetail } from "@myapp/shared";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useUpdateCustomer } from "@/hooks/customers/use-update-customer";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/customers/summary/$customerId/"
)({
  validateSearch: z.object({
    mode: z.enum(["read", "edit"]).default("read"),
  }),
  loader({ params }) {
    queryClient.ensureQueryData(
      trpc.basicInfo.readCustomer.queryOptions(params.customerId)
    );
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { customerId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: customer } = useSuspenseCustomer(customerId);
  const formRef = useRef<CustomerFormRef>(null);
  const { updateCustomer, isPending } = useUpdateCustomer();

  const isEditMode = search.mode === "edit";

  const handleToggleEdit = (defaultValues?: CustomerDetail) => {
    if (isEditMode) {
      formRef.current?.reset(defaultValues);
    }
    navigate({
      search: (prev) => ({
        ...prev,
        mode: isEditMode ? "read" : "edit",
      }),
    });
  };

  const handleSubmit = async (data: CustomerDetail) => {
    updateCustomer(
      { customerId, data },
      {
        onSuccess(c) {
          queryClient.invalidateQueries({
            queryKey:
              trpc.basicInfo.readCustomer.queryOptions(customerId).queryKey,
          });
          toast.success("成功更新客戶資訊");
          handleToggleEdit({
            ...data,
            contacts: c.contacts,
          });
        },
        onError() {
          toast.error("無法更新客戶資訊");
        },
      }
    );

    // reset defaultValues after success
  };

  return (
    <PageShell
      header={
        <div className="flex justify-between">
          <Button asChild>
            <Link to="/customers/summary">返回列表</Link>
          </Button>

          {isEditMode ? (
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleToggleEdit()}
                disabled={isPending}
                key="cancel-edit-button"
              >
                取消
              </Button>
              <Button
                type="submit"
                form="customer-form"
                disabled={isPending}
                key="submit-button"
              >
                {isPending ? "更新中..." : "儲存"}
              </Button>
            </div>
          ) : (
            <div className="space-x-2">
              <Button asChild variant={"secondary"} key="new-project-button">
                <Link
                  to="/customers/summary/$customerId/projects/create"
                  params={{ customerId }}
                >
                  新增專案
                </Link>
              </Button>
              <Button asChild variant={"secondary"} key="list-projects-button">
                <Link
                  to="/customers/summary/$customerId/projects"
                  params={{ customerId }}
                >
                  專案列表
                </Link>
              </Button>
              <Button
                key="edit-button"
                type="button"
                onClick={() => handleToggleEdit()}
              >
                編輯
              </Button>
            </div>
          )}
        </div>
      }
    >
      <ScrollableBody disabled={isPending}>
        <CustomerForm
          customerFormRef={formRef}
          disabled={!isEditMode || isPending}
          initialData={customer}
          onSubmit={handleSubmit}
        />
      </ScrollableBody>
    </PageShell>
  );
}
