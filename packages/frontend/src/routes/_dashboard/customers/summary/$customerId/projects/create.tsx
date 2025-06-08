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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { ProjectFormValue } from "@myapp/shared";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/customers/summary/$customerId/projects/create"
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  // Store project creation state with customer context to prevent cross-customer redirects
  const [projectCreationState, setProjectCreationState] = useLocalStorage(
    "project-creation-state",
    { customerId: "", projectId: "", isProcessing: false }
  );
  const navigate = Route.useNavigate();
  const { customerId } = Route.useParams();
  const { mutate: createProject, isPending } = useMutation(
    trpc.basicInfo.createProject.mutationOptions()
  );
  const { handleBomUploadAndQueue } = useBomUploadAndQueue();
  const { handleNcUpload } = useNcUpload();
  const { uploadConstructorPdf } = useConstructorPdfUpload();
  const { uploadInstalledPlanePdf } = useInstalledPlanePdfUpload();
  const { uploadDesignedPlanePdf } = useDesignedPlanePdfUpload();

  // We'll set up the file configs dynamically in the handleSubmit function
  // based on which files are actually present
  const {
    fileStatuses,
    overallProgress,
    updateFileProgress,
    resetProgress,
    setupFileConfigs,
  } = useMultiFileUploadProgress();
  console.log(fileStatuses);

  const handleSubmit = (data: ProjectFormValue) => {
    // Extract files from form data
    const {
      bom,
      nc,
      constructorPDF,
      installedPlanePDF,
      designedPlanePDF,
      ...projectData
    } = data;
    console.log(bom, nc, constructorPDF);
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

    if (constructorPDF) {
      dynamicFileConfigs.push({
        fileId: "constructorPDF" as const,
        weight: 1,
        totalStages: 1,
      });
    }

    if (installedPlanePDF) {
      dynamicFileConfigs.push({
        fileId: "installedPlanePDF" as const,
        weight: 1,
        totalStages: 1,
      });
    }

    if (designedPlanePDF) {
      dynamicFileConfigs.push({
        fileId: "designedPlanePDF" as const,
        weight: 1,
        totalStages: 1,
      });
    }

    setupFileConfigs(dynamicFileConfigs);

    createProject(projectData, {
      onSuccess: async (project) => {
        // Save project creation state with customer context and processing flag
        setProjectCreationState({
          customerId,
          projectId: project.id,
          isProcessing: true,
        });

        // Track upload completion status
        let bomUploadComplete = false;
        let ncUploadComplete = false;
        let constructorUploadComplete = false;
        let installedPlanePdfUploadComplete = false;
        let designedPlanePdfUploadComplete = false;

        // Function to check if all uploads are complete and navigate
        const checkAllUploadsAndNavigate = () => {
          if (
            bomUploadComplete &&
            ncUploadComplete &&
            constructorUploadComplete &&
            installedPlanePdfUploadComplete &&
            designedPlanePdfUploadComplete
          ) {
            // All uploads are complete, invalidate queries and navigate
            queryClient.invalidateQueries({
              queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
            });
            queryClient.invalidateQueries({
              queryKey: trpc.production.readSimpleProjects.queryKey(),
            });

            // Clear processing state since uploads are complete
            setProjectCreationState({
              customerId: "",
              projectId: "",
              isProcessing: false,
            });

            // Navigate to project detail page
            navigate({
              to: "/customers/summary/$customerId/projects/$projectId",
              params: {
                customerId,
                projectId: project.id,
              },
            });
          }
        };

        // Start all uploads in parallel
        const uploadPromises = [];

        // Reset progress tracking before starting new uploads
        resetProgress();

        // Only attempt BOM upload if a BOM file exists
        if (bom instanceof File) {
          const bomPromise = handleBomUploadAndQueue(
            { projectId: project.id, bom },
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
          // Mark BOM as complete if not present
          bomUploadComplete = true;
        }

        // Only attempt NC upload if an NC file exists
        if (nc instanceof File) {
          const ncPromise = handleNcUpload(
            { projectId: project.id, nc },
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
          // Mark NC as complete if not present
          ncUploadComplete = true;
        }

        // Only attempt Constructor PDF upload if a file exists
        if (constructorPDF instanceof File) {
          // Note: uploadConstructorPdf internally handles form.setValue and progress for its own hook context
          // We still need to manage the local completion flag for checkAllUploadsAndNavigate
          const constructorPdfPromise = uploadConstructorPdf(
            { projectId: project.id, constructorPDFFile: constructorPDF },
            {
              onUploadProgress: (progress: number) => {
                // The hook's internal updateFileProgress handles the ProjectForm UI.
                // This one is for the create.tsx page's overall progress if needed, or can be omitted
                // if ProjectForm's progress is sufficient.
                // For consistency, let's assume create.tsx might want its own tracking or logging.
                updateFileProgress("constructorPDF", "upload", progress);
              },
              onSuccess: () => {
                // result parameter is available if needed
                updateFileProgress("constructorPDF", "complete", 100);
                constructorUploadComplete = true;
                checkAllUploadsAndNavigate();
              },
              onError: (error) => {
                updateFileProgress("constructorPDF", "error", 0);
                console.error("Constructor PDF upload failed:", error);
                // constructorUploadComplete = true; // Decide if error means 'complete' for navigation
                // checkAllUploadsAndNavigate(); // Or handle error state differently
              },
              onComplete: () => {
                // This will be called after success or error by the hook's finally block.
                // If an error occurs, we might not want to immediately mark as 'complete' for navigation
                // unless that's the desired behavior (e.g., proceed with other successful uploads).
                // For now, let's ensure navigation logic considers this.
                // If an error occurs, onError is called. If successful, onSuccess is called.
                // onComplete in the hook is for its internal cleanup or final state update.
                // The checkAllUploadsAndNavigate is best called from onSuccess or a more specific error handling.
                // Let's ensure constructorUploadComplete is true only on actual success for now.
                // If an error happens, it won't be marked complete, and checkAllUploadsAndNavigate won't proceed
                // unless we explicitly want to allow navigation despite some failures.
              },
            }
          );
          uploadPromises.push(constructorPdfPromise);
        } else {
          constructorUploadComplete = true;
        }

        // Only attempt Installed Plane PDF upload if a file exists
        if (installedPlanePDF instanceof File) {
          const installedPlanePdfPromise = uploadInstalledPlanePdf(
            { projectId: project.id, installedPlanePDFFile: installedPlanePDF },
            {
              onUploadProgress: (progress: number) => {
                updateFileProgress("installedPlanePDF", "upload", progress);
              },
              onSuccess: () => {
                updateFileProgress("installedPlanePDF", "complete", 100);
                installedPlanePdfUploadComplete = true;
                checkAllUploadsAndNavigate();
              },
              onError: (error) => {
                updateFileProgress("installedPlanePDF", "error", 0);
                console.error("Installed Plane PDF upload failed:", error);
              },
            }
          );
          uploadPromises.push(installedPlanePdfPromise);
        } else {
          installedPlanePdfUploadComplete = true;
        }

        // Only attempt Designed Plane PDF upload if a file exists
        if (designedPlanePDF instanceof File) {
          const designedPlanePdfPromise = uploadDesignedPlanePdf(
            { projectId: project.id, designedPlanePDFFile: designedPlanePDF },
            {
              onUploadProgress: (progress: number) => {
                updateFileProgress("designedPlanePDF", "upload", progress);
              },
              onSuccess: () => {
                updateFileProgress("designedPlanePDF", "complete", 100);
                designedPlanePdfUploadComplete = true;
                checkAllUploadsAndNavigate();
              },
              onError: (error) => {
                updateFileProgress("designedPlanePDF", "error", 0);
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
        } catch (error) {
          console.error("One or more uploads failed:", error);
          // Even if some uploads fail, we'll let the onComplete callbacks handle navigation
        }
      },
      onError: (error) => {
        console.error("Project creation failed:", error);
        toast.error(`專案建立失敗: ${error.message}`);
      },
      onSettled() {
        setProjectCreationState({
          customerId: "",
          projectId: "",
          isProcessing: false,
        });
      },
    });
  };

  useEffect(() => {
    // Check if there's an ongoing project creation for this customer
    const {
      customerId: storedCustomerId,
      projectId: storedProjectId,
      isProcessing,
    } = projectCreationState;

    // Only redirect if:
    // 1. We have a stored project that's still processing
    // 2. The stored customer ID matches the current route's customer ID
    if (isProcessing && storedProjectId && storedCustomerId === customerId) {
      navigate({
        to: "/customers/summary/$customerId/projects/$projectId",
        params: {
          customerId,
          projectId: storedProjectId,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

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
              disabled={isPending}
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
          onSubmit={handleSubmit}
          disabled={isPending}
          fileStatuses={fileStatuses}
        />
      </ScrollableBody>
    </PageShell>
  );
}
