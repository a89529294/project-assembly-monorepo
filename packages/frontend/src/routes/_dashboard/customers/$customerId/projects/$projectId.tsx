import { PageShell } from "@/components/layout/page-shell";
import { ScrollableBody } from "@/components/layout/scrollable-body";
import { PendingComponent } from "@/components/pending-component";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBomUploadAndQueue } from "@/hooks/use-bom-upload-and-queue";

import { trpc } from "@/trpc";
import { ProjectFormValue } from "@myapp/shared";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/customers/$customerId/projects/$projectId"
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { customerId, projectId } = Route.useParams();

  const { handleBomUploadAndQueue, processProgress, uploadProgress, state } =
    useBomUploadAndQueue({ customerId, projectState: "create" });

  // Fetch project data
  const { data: project } = useSuspenseQuery(
    trpc.basicInfo.readProject.queryOptions(projectId)
  );

  const { mutate: updateProject, isPending } = useMutation(
    trpc.basicInfo.updateProject.mutationOptions()
  );

  const handleSubmit = async (formData: ProjectFormValue) => {
    const { bom, ...projectData } = formData;

    updateProject(
      {
        projectId,
        data: projectData,
      },
      {
        onSuccess: async (project) => {
          await handleBomUploadAndQueue({ projectId: project.id, bom });
        },
        onError: (error) => {
          console.error("Project creation failed:", error);
          toast.error(`更新專案失敗: ${error.message}`);
        },
      }
    );
  };

  const uploadOrProcessText = (() => {
    if (state === "uploading") return "上傳中...";

    if (processProgress?.status === "failed") return "匯入失敗";
    if (processProgress?.status === "done") return "匯入完成";

    if (
      processProgress?.status === "processing" ||
      processProgress?.status === "waiting"
    )
      return "匯入中...";

    return "未知狀態";
  })();

  const progressBar = (() => {
    console.log(state, processProgress);

    if (state === "idle") return null;

    let progress = 0;

    if (state === "uploading") progress = uploadProgress;

    if (state === "processing") {
      if (processProgress?.status === "done") progress = 100;
      if (processProgress?.status === "failed") return null;
      if (
        processProgress?.status === "processing" ||
        processProgress?.status === "waiting"
      )
        progress = processProgress.progress;
    }

    return <Progress value={progress} className="h-2 flex-1" />;
  })();

  return (
    <PageShell
      header={
        <div className="flex justify-between items-center mb-6">
          <Button asChild type="button" variant="outline">
            <Link
              to={"/customers/$customerId/projects"}
              params={{ customerId }}
              disabled={isPending}
            >
              返回專案列表
            </Link>
          </Button>
          <div className="flex gap-2 items-center">
            {(state === "processing" || state === "uploading") && (
              <div className="flex items-center gap-2 w-60">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {uploadOrProcessText}
                </span>
                {progressBar}
              </div>
            )}
            <Button type="submit" form="project-form" disabled={isPending}>
              儲存
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
          disabled={isPending}
          projectId={projectId}
        />
      </ScrollableBody>
    </PageShell>
  );
}
