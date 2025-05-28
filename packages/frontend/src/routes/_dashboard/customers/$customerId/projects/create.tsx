import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { ProjectCreate } from "@myapp/shared";
import { privateFetch } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScrollableBody } from "@/components/layout/scrollable-body";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute(
  "/_dashboard/customers/$customerId/projects/create"
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { customerId } = Route.useParams();
  const [projectId, setProjectId] = useState<string | null>(null);
  const { mutate: startBomProcessing } = useMutation(
    trpc.basicInfo.onBomUploadSuccess.mutationOptions()
  );
  const { mutate } = useMutation(
    trpc.basicInfo.createProject.mutationOptions()
  );
  const { refetch, data: importProgress } = useQuery(
    trpc.basicInfo.checkBomImportStatus.queryOptions(projectId!, {
      enabled: !!projectId,
    })
  );
  const navigate = Route.useNavigate();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const handleSubmit = async (data: ProjectCreate) => {
    console.log(data);
    const { bom, ...projectData } = data;

    setIsCreatingProject(true);
    mutate(projectData, {
      onSuccess: async (project) => {
        // If there's a BOM file, upload it after project creation
        if (bom && project.id) {
          setProjectId(project.id);

          try {
            // 1. Get pre-signed URL and file path from your backend
            const { uploadUrl, s3Key } = await privateFetch(
              `/file/presigned-url/bom-upload/${project.id}`
            ).then((res) => res.json());

            // 2. Upload directly to S3 with progress tracking
            await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open("PUT", uploadUrl, true);
              xhr.setRequestHeader("Content-Type", "text/csv");

              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const percentComplete = Math.round(
                    (event.loaded / event.total) * 100
                  );
                  setUploadProgress(percentComplete);
                }
              };

              xhr.onload = async () => {
                let intervalId = 1;
                if (xhr.status === 200) {
                  try {
                    // 3. Notify backend about successful upload and store the file path
                    const eTag = xhr.getResponseHeader("ETag");

                    // Start BOM processing
                    await startBomProcessing({
                      eTag: eTag ? eTag.replace(/^"|"$/g, "") : "",
                      fileSize: bom.size,
                      projectId: project.id,
                      s3Key,
                    });

                    // Set importing state and reset progress
                    setIsImporting(true);

                    const checkBomImportStatus = async () => {
                      const { data: currentProgress } = await refetch();

                      if (currentProgress === 100) {
                        clearInterval(intervalId);
                        resolve("");
                      }
                    };

                    // Initial check
                    await checkBomImportStatus();

                    // Set up polling every 5 seconds
                    intervalId = window.setInterval(checkBomImportStatus, 5000);
                  } catch (e) {
                    console.log(e);

                    clearInterval(intervalId);
                  }
                } else {
                  reject(new Error("Upload failed"));
                }
              };

              xhr.onerror = () => reject(new Error("Upload failed"));
              xhr.send(bom);
            });

            navigate({ to: "/customers/$customerId/projects" });
          } catch (error) {
            console.error("Upload error:", error);
            toast.error("上傳 BOM 檔案時發生錯誤");
          }
        }

        setUploadProgress(0);
        toast.success("成功新增專案");
        queryClient.invalidateQueries({
          queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
        });
        // navigate({
        //   to: "/customers/$customerId/projects",
        //   params: { customerId },
        // });
        setIsCreatingProject(false);
      },
      onError() {
        setIsCreatingProject(false);
      },
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
              disabled={isCreatingProject}
            >
              返回專案列表
            </Link>
          </Button>
          <div className="flex gap-2 items-center">
            {isCreatingProject && (
              <div className="flex items-center gap-2 w-60">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {isImporting
                    ? `匯入中... ${importProgress ?? 0}%`
                    : `上傳中... ${uploadProgress}%`}
                </span>
                <Progress
                  value={isImporting ? importProgress || 0 : uploadProgress}
                  className="h-2 flex-1"
                />
              </div>
            )}
            <Button
              type="submit"
              form="project-form"
              disabled={isCreatingProject}
            >
              儲存
            </Button>
          </div>
        </div>
      }
    >
      <ScrollableBody>
        <ProjectForm
          customerId={customerId}
          onSubmit={handleSubmit}
          disabled={isCreatingProject}
        />
      </ScrollableBody>
    </PageShell>
  );
}
