import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { ProjectCreate } from "@myapp/shared";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/customers/$customerId/projects/create"
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { customerId } = Route.useParams();
  const { mutate, isPending: isCreatingProject } = useMutation(
    trpc.basicInfo.createProject.mutationOptions()
  );
  const navigate = Route.useNavigate();

  const handleSubmit = async (data: ProjectCreate) => {
    mutate(data, {
      onSuccess() {
        toast.success("成功新增專案");
        queryClient.invalidateQueries({
          queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
        });
        navigate({
          to: "/customers/$customerId/projects",
          params: { customerId },
        });
      },
      onError() {},
    });
  };

  return (
    <PageShell
      header={
        <div className="flex justify-between items-center mb-6">
          <Button asChild type="button" variant="outline">
            <Link
              to={"/customers/$customerId/projects"}
              params={{ customerId }}
            >
              返回專案列表
            </Link>
          </Button>
          <Button
            type="submit"
            form="project-form"
            disabled={isCreatingProject}
          >
            {isCreatingProject ? "儲存中..." : "儲存"}
          </Button>
        </div>
      }
    >
      <div className="flex-1 relative">
        <ProjectForm
          customerId={customerId}
          onSubmit={handleSubmit}
          disabled={false}
        />
      </div>
    </PageShell>
  );
}
