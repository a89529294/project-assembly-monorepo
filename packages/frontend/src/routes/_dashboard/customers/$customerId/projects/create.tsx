import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { ProjectCreate } from "@myapp/shared";
import { privateFetch } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
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
  const { mutate } = useMutation(
    trpc.basicInfo.createProject.mutationOptions()
  );
  const navigate = Route.useNavigate();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (data: ProjectCreate) => {
    const { bom, ...projectData } = data;

    setIsCreatingProject(true);
    mutate(projectData, {
      onSuccess: async (project) => {
        // If there's a BOM file, upload it after project creation
        if (bom && project.id) {
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
                if (xhr.status === 200) {
                  try {
                    // 3. Notify backend about successful upload and store the file path
                    const eTag = xhr.getResponseHeader("ETag");
                    console.log(s3Key);
                    console.log(eTag);
                    // const fileName = "TeklaBom.csv";
                    // const fileSize = bom.size;
                    // const uploadedBy = user.id;

                    resolve(undefined);
                  } catch (error) {
                    console.error("Failed to update file path:", error);
                    reject(new Error("Failed to update file information"));
                  }
                } else {
                  reject(new Error("Upload failed"));
                }
              };

              xhr.onerror = () => reject(new Error("Upload failed"));
              xhr.send(bom);
            });
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
        navigate({
          to: "/customers/$customerId/projects",
          params: { customerId },
        });
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
              <Progress value={uploadProgress} className="h-2 w-60" />
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
