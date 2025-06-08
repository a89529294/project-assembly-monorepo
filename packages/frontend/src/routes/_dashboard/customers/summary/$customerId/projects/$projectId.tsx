import { PageShell } from "@/components/layout/page-shell";
import { ScrollableBody } from "@/components/layout/scrollable-body";
import { PendingComponent } from "@/components/pending-component";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBomUploadAndQueue } from "@/hooks/use-bom-upload-and-queue";
import { useNcUpload } from "@/hooks/use-nc-upload";
import { useConstructorPdfUpload } from "@/hooks/use-constructor-pdf-upload";
import { useInstalledPlanePdfUpload } from "@/hooks/use-installed-plane-pdf-upload";
import { useDesignedPlanePdfUpload } from "@/hooks/use-designed-plane-pdf-upload";
import { useMultiFileUploadProgress } from "@/hooks/use-multi-file-upload-progress";
import { queryClient } from "@/query-client";

import { trpc } from "@/trpc";
import { ProjectFormValue } from "@myapp/shared";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/customers/summary/$customerId/projects/$projectId"
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { customerId, projectId } = Route.useParams();
  const navigate = Route.useNavigate();

  const { handleBomUploadAndQueue } = useBomUploadAndQueue();
  const { handleNcUpload } = useNcUpload();
  const { uploadConstructorPdf } = useConstructorPdfUpload();
  const { uploadInstalledPlanePdf } = useInstalledPlanePdfUpload();
  const { uploadDesignedPlanePdf } = useDesignedPlanePdfUpload();

  // Use the new pattern with setupFileConfigs
  const {
    fileStatuses,
    overallProgress,
    updateFileProgress,
    resetProgress,
    setupFileConfigs,
  } = useMultiFileUploadProgress();

  // Fetch project data
  const { data: project } = useSuspenseQuery(
    trpc.basicInfo.readProject.queryOptions(projectId)
  );

  const { mutate: updateProject, isPending: isUpdateProjectPending } =
    useMutation(trpc.basicInfo.updateProject.mutationOptions());

  const isAnyFileProcessing = fileStatuses.some(
    (status) => status.stage === "upload"
  );
  const isFormBusy = isUpdateProjectPending || isAnyFileProcessing;

  const handleSubmit = async (formData: ProjectFormValue) => {
    const {
      bom,
      nc,
      constructorPDF,
      installedPlanePDF,
      designedPlanePDF,
      ...projectData
    } = formData;

    const dynamicFileConfigs = [];

    // Add BOM config if BOM file is present
    if (bom) {
      dynamicFileConfigs.push({
        fileId: "bom" as const,
        weight: 1,
        totalStages: 2,
      });
    }

    // Add NC config if NC file is present
    if (nc) {
      dynamicFileConfigs.push({
        fileId: "nc" as const,
        weight: 1,
        totalStages: 1,
      });
    }

    // Add Constructor PDF config if present
    if (constructorPDF) {
      dynamicFileConfigs.push({
        fileId: "constructorPDF" as const,
        weight: 1,
        totalStages: 1,
      });
    }

    // Add Installed Plane PDF config if present
    if (installedPlanePDF) {
      dynamicFileConfigs.push({
        fileId: "installedPlanePDF" as const,
        weight: 1,
        totalStages: 1,
      });
    }

    // Add Designed Plane PDF config if present
    if (designedPlanePDF) {
      dynamicFileConfigs.push({
        fileId: "designedPlanePDF" as const,
        weight: 1,
        totalStages: 1,
      });
    }

    setupFileConfigs(dynamicFileConfigs);

    updateProject(
      {
        projectId,
        data: projectData,
      },
      {
        onSuccess: async () => {
          // Reset progress tracking
          resetProgress();
          // Track upload completion status
          let bomUploadComplete = false;
          let ncUploadComplete = false;
          let constructorPdfUploadComplete = false;
          let installedPlanePdfUploadComplete = false;
          let designedPlanePdfUploadComplete = false;

          // Function to check if all uploads are complete and navigate
          const checkAllUploadsAndNavigate = () => {
            if (
              bomUploadComplete &&
              ncUploadComplete &&
              constructorPdfUploadComplete &&
              installedPlanePdfUploadComplete &&
              designedPlanePdfUploadComplete
            ) {
              // All uploads are complete, invalidate queries and navigate
              queryClient.invalidateQueries({
                queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
              });

              // Navigate back to projects list
              navigate({
                to: "/customers/summary/$customerId/projects",
                params: { customerId },
              });
            }
          };

          // Start all uploads in parallel
          const uploadPromises = [];

          // BOM upload and processing
          if (bom instanceof File) {
            const bomPromise = handleBomUploadAndQueue(
              { projectId, bom },
              {
                onUploadProgress: (progress: number) => {
                  updateFileProgress("bom", "upload", progress);
                },
                onProcessProgress: (progress: number) => {
                  updateFileProgress("bom", "process", progress, 1);
                },
                onComplete: () => {
                  updateFileProgress("bom", "complete", 100, 1);
                  bomUploadComplete = true;
                  checkAllUploadsAndNavigate();
                },
                onError: (error) => {
                  updateFileProgress("bom", "error", 0);
                  console.error("BOM upload/process failed:", error);
                },
              }
            );
            uploadPromises.push(bomPromise);
          } else {
            // No BOM file to upload, mark as complete
            bomUploadComplete = true;
          }

          // NC upload
          if (nc instanceof File) {
            const ncPromise = handleNcUpload(
              { projectId, nc },
              {
                onUploadProgress: (progress: number) => {
                  updateFileProgress("nc", "upload", progress);
                },
                onComplete: () => {
                  updateFileProgress("nc", "complete", 100);
                  ncUploadComplete = true;
                  checkAllUploadsAndNavigate();
                },
                onError: (error) => {
                  updateFileProgress("nc", "error", 0);
                  console.error("NC upload failed:", error);
                },
              }
            );
            uploadPromises.push(ncPromise);
          } else {
            // No NC file to upload, mark as complete
            ncUploadComplete = true;
          }

          // Constructor PDF upload
          if (constructorPDF instanceof File) {
            const constructorPdfPromise = uploadConstructorPdf(
              { projectId, constructorPDFFile: constructorPDF },
              {
                onUploadProgress: (progress: number) => {
                  updateFileProgress("constructorPDF", "upload", progress, 0);
                },
                onComplete: () => {
                  updateFileProgress("constructorPDF", "complete", 100, 0);
                  constructorPdfUploadComplete = true;
                  checkAllUploadsAndNavigate();
                },
                onError: (error) => {
                  updateFileProgress("constructorPDF", "error", 0, 0);
                  console.error("Constructor PDF upload failed:", error);
                },
              }
            );
            uploadPromises.push(constructorPdfPromise);
          } else {
            constructorPdfUploadComplete = true;
          }

          // Installed Plane PDF upload
          if (installedPlanePDF instanceof File) {
            const installedPlanePdfPromise = uploadInstalledPlanePdf(
              { projectId, installedPlanePDFFile: installedPlanePDF },
              {
                onUploadProgress: (progress: number) => {
                  updateFileProgress(
                    "installedPlanePDF",
                    "upload",
                    progress,
                    0
                  );
                },
                onComplete: () => {
                  updateFileProgress("installedPlanePDF", "complete", 100, 0);
                  installedPlanePdfUploadComplete = true;
                  checkAllUploadsAndNavigate();
                },
                onError: (error) => {
                  updateFileProgress("installedPlanePDF", "error", 0, 0);
                  console.error("Installed Plane PDF upload failed:", error);
                },
              }
            );
            uploadPromises.push(installedPlanePdfPromise);
          } else {
            installedPlanePdfUploadComplete = true;
          }

          // Designed Plane PDF upload
          if (designedPlanePDF instanceof File) {
            const designedPlanePdfPromise = uploadDesignedPlanePdf(
              { projectId, designedPlanePDFFile: designedPlanePDF },
              {
                onUploadProgress: (progress: number) => {
                  updateFileProgress("designedPlanePDF", "upload", progress, 0);
                },
                onComplete: () => {
                  updateFileProgress("designedPlanePDF", "complete", 100, 0);
                  designedPlanePdfUploadComplete = true;
                  checkAllUploadsAndNavigate();
                },
                onError: (error) => {
                  updateFileProgress("designedPlanePDF", "error", 0, 0);
                  console.error("Designed Plane PDF upload failed:", error);
                },
              }
            );
            uploadPromises.push(designedPlanePdfPromise);
          } else {
            designedPlanePdfUploadComplete = true;
          }

          // Wait for all uploads to complete or fail
          try {
            await Promise.all(uploadPromises);

            toast.success("更新專案成功");
          } catch (error) {
            console.error("One or more uploads failed:", error);
            // Even if some uploads fail, we'll let the onComplete callbacks handle navigation
          }
        },
        onError: (error) => {
          console.error("Project update failed:", error);
          toast.error(`更新專案失敗: ${error.message}`);
        },
      }
    );
  };

  // Get appropriate status message based on progress
  const getStatusMessage = () => {
    if (overallProgress === 0) return "";
    if (overallProgress === 100) return "上傳和處理完成";
    return `上傳和處理中... ${Math.round(overallProgress)}%`;
  };

  return (
    <PageShell
      header={
        <div className="flex justify-between items-center mb-6">
          <Button asChild type="button" variant="outline">
            <Link
              to={"/customers/summary/$customerId/projects"}
              params={{ customerId }}
              disabled={isFormBusy}
            >
              返回專案列表
            </Link>
          </Button>
          <div className="flex gap-2 items-center">
            {overallProgress > 0 && overallProgress < 100 && (
              <div className="flex items-center gap-2 w-60">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {getStatusMessage()}
                </span>
                <Progress value={overallProgress} className="h-2 flex-1" />
              </div>
            )}
            <Button type="submit" form="project-form" disabled={isFormBusy}>
              儲存
            </Button>
          </div>
        </div>
      }
    >
      <ScrollableBody>
        {/* Progress bar for file uploads - full width version */}
        {overallProgress > 0 && overallProgress < 100 && (
          <div className="container mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{getStatusMessage()}</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        )}

        <ProjectForm
          customerId={customerId}
          initialData={project}
          onSubmit={handleSubmit}
          disabled={isFormBusy}
          projectId={projectId}
          fileStatuses={fileStatuses}
        />
      </ScrollableBody>
    </PageShell>
  );
}
