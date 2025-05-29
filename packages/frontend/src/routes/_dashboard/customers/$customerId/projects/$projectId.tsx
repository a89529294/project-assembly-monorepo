import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { ProjectFormValue } from "@myapp/shared";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScrollableBody } from "@/components/layout/scrollable-body";
import { useState } from "react";

export const Route = createFileRoute(
  "/_dashboard/customers/$customerId/projects/$projectId"
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { customerId, projectId } = Route.useParams();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch project data
  const { data: project } = useSuspenseQuery(
    trpc.basicInfo.readProject.queryOptions(projectId)
  );

  const { mutate } = useMutation(
    trpc.basicInfo.updateProject.mutationOptions()
  );

  const handleSubmit = async (formData: ProjectFormValue) => {
    setIsUpdating(true);

    try {
      await mutate(
        {
          projectId,
          data: formData,
        },
        {
          onSuccess: () => {
            // TODO: reference create page for complete flow
            // Need to decide whether to upload bom or not and then decide if we need to add bom to queue

            toast.success("成功更新專案");
            // Invalidate the projects list and current project queries
            queryClient.invalidateQueries({
              queryKey:
                trpc.basicInfo.readProject.queryOptions(projectId).queryKey,
            });
          },
          onError: (error) => {
            console.error("Error updating project:", error);
            toast.error(`更新專案時發生錯誤: ${error.message}`);
          },
          onSettled: () => {
            setIsUpdating(false);
          },
        }
      );
    } catch (error) {
      console.error("Error in mutation:", error);
      toast.error("更新專案時發生未預期的錯誤");
      setIsUpdating(false);
    }
  };

  return (
    <PageShell
      header={
        <div className="flex justify-between items-center mb-6">
          <Button asChild type="button" variant="outline">
            <Link
              to={"/customers/$customerId/projects"}
              params={{ customerId }}
              disabled={isUpdating}
            >
              返回專案列表
            </Link>
          </Button>
          <div className="flex gap-2 items-center">
            <Button type="submit" form="project-form" disabled={isUpdating}>
              {isUpdating ? "更新中..." : "更新專案"}
            </Button>
          </div>
        </div>
      }
    >
      <ScrollableBody>
        <ProjectForm
          customerId={customerId}
          initialData={project}
          onSubmit={handleSubmit}
          disabled={isUpdating}
        />
      </ScrollableBody>
    </PageShell>
  );
}
