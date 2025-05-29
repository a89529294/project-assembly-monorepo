import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { privateFetch } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScrollableBody } from "@/components/layout/scrollable-body";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { ProjectFormValue } from "@myapp/shared";

export const Route = createFileRoute(
  "/_dashboard/customers/$customerId/projects/create"
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { customerId } = Route.useParams();
  const [projectId, setProjectId] = useState<string | null>(null);
  const { mutate: createProject } = useMutation(
    trpc.basicInfo.createProject.mutationOptions()
  );
  const { mutate: addBomToProcessQueue } = useMutation(
    trpc.basicInfo.onAddBomToProcessQueue.mutationOptions()
  );
  const {
    refetch: checkBomProcess,
    data: processBomProgress,
    isError: processBomError,
  } = useQuery(
    trpc.basicInfo.checkBomProcessStatus.queryOptions(projectId!, {
      enabled: !!projectId,
    })
  );
  const navigate = Route.useNavigate();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const uploadToS3 = (file: File, uploadUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", "text/csv");
      xhr.timeout = 300000; // 5 minutes

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const eTag = xhr.getResponseHeader("ETag");
          resolve(eTag ? eTag.replace(/^"|"$/g, "") : "");
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = xhr.ontimeout = () => reject(new Error("Upload failed"));
      xhr.send(file);
    });
  };

  const waitForBomImport = async (): Promise<void> => {
    setIsImporting(true);
    const maxAttempts = 60; // 5 minutes

    try {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

        const { data: progress, isError } = await checkBomProcess();

        if (isError) {
          // Handle backend errors - this means the job failed or had issues
          throw new Error("匯入BOM表出錯");
        }

        if (progress === 100) {
          // Success! BOM import completed
          toast.success("BOM 匯入完成");
          setIsCreatingProject(false);
          setIsImporting(false);
          setUploadProgress(0);
          queryClient.invalidateQueries({
            queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
          });
          navigate({ to: "/customers/$customerId/projects" });
          return;
        }
      }

      // Timeout reached
      throw new Error("Import timeout");
    } catch (error: unknown) {
      console.error("BOM import failed:", error);
      toast.error("BOM 匯入過程出錯，請稍後重新上傳BOM表");

      // Clean up states and navigate
      setIsCreatingProject(false);
      setIsImporting(false);
      setUploadProgress(0);
      queryClient.invalidateQueries({
        queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
      });
      navigate({ to: "/customers/$customerId/projects" });
    }
  };

  const handleSubmit = (data: ProjectFormValue) => {
    console.log(data);
    const { bom, ...projectData } = data;

    setIsCreatingProject(true);

    createProject(projectData, {
      onSuccess: async (project) => {
        // SUCCESS: Project created successfully

        // Case 1: No BOM file
        if (typeof bom === "undefined" || typeof bom === "string") {
          toast.success("成功新增專案");
          setIsCreatingProject(false);
          queryClient.invalidateQueries({
            queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
          });
          navigate({ to: "/customers/$customerId/projects" });
          return;
        }

        // Case 2: Has BOM file - start upload process
        setProjectId(project.id);

        try {
          // Step 1: Get presigned URL and upload to S3
          const { uploadUrl, s3Key } = await privateFetch(
            `/file/presigned-url/bom-upload/${project.id}`
          ).then((res) => res.json());

          const eTag = await uploadToS3(bom, uploadUrl);

          // Step 2: Add BOM to process queue
          addBomToProcessQueue(
            {
              eTag,
              fileSize: bom.size,
              projectId: project.id,
              s3Key,
            },
            {
              onSuccess: (queueResult) => {
                if (queueResult.status === "waiting") {
                  // TRUE SUCCESS - BOM processing starts
                  toast.success("專案建立成功，BOM 處理開始");
                  // Don't navigate - stay on page and start polling
                  waitForBomImport();
                } else if (queueResult.status === "skipped") {
                  toast.error("無需處理 BOM");
                  setIsCreatingProject(false);
                  setUploadProgress(0);
                  queryClient.invalidateQueries({
                    queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
                  });
                  navigate({ to: "/customers/$customerId/projects" });
                } else if (queueResult.status === "failed") {
                  toast.error("無法將 BOM 加入處理佇列，請稍後再試");
                  setIsCreatingProject(false);
                  setUploadProgress(0);
                  queryClient.invalidateQueries({
                    queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
                  });
                  navigate({ to: "/customers/$customerId/projects" });
                }
              },
              onError: (error) => {
                console.error("Failed to add BOM to queue:", error);
                toast.error("無法將 BOM 加入處理佇列，請稍後再試");
                setIsCreatingProject(false);
                setUploadProgress(0);
                queryClient.invalidateQueries({
                  queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
                });
                navigate({ to: "/customers/$customerId/projects" });
              },
            }
          );
        } catch (uploadError) {
          // S3 upload failed
          console.error("BOM upload failed:", uploadError);
          toast.success("專案建立成功");
          toast.error("BOM 上傳失敗，請稍後重新上傳");
          setIsCreatingProject(false);
          setUploadProgress(0);
          queryClient.invalidateQueries({
            queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
          });
          navigate({ to: "/customers/$customerId/projects" });
        }
      },

      onError: (error) => {
        // FAIL: Project creation failed
        console.error("Project creation failed:", error);
        toast.error(`專案建立失敗: ${error.message}`);
        setIsCreatingProject(false);
        // Don't reset form data - stay on page for user to retry
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
                    ? processBomError
                      ? "匯入失敗"
                      : `匯入中... ${processBomProgress ?? 0}%`
                    : `上傳中... ${uploadProgress}%`}
                </span>
                <Progress
                  value={isImporting ? processBomProgress || 0 : uploadProgress}
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
