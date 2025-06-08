import { useFileUpload } from "./use-file-upload";
import { useMultiFileUploadProgress } from "./use-multi-file-upload-progress";

export type InstalledPlanePdfUploadCallbacks = {
  onUploadProgress?: (progress: number) => void;
  onSuccess?: (result: {
    eTag: string;
    s3Key: string;
    fileSize: number;
  }) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
};

export type InstalledPlanePdfUploadParams = {
  projectId: string;
  installedPlanePDFFile: File;
};

export function useInstalledPlanePdfUpload() {
  const { handleFileUpload } = useFileUpload();
  const { updateFileProgress } = useMultiFileUploadProgress();

  const uploadInstalledPlanePdf = async (
    { projectId, installedPlanePDFFile }: InstalledPlanePdfUploadParams,
    callbacks?: InstalledPlanePdfUploadCallbacks
  ) => {
    updateFileProgress("installedPlanePDF", "upload", 0, 0);
    try {
      const result = await handleFileUpload(
        {
          file: installedPlanePDFFile,
          fileType: "安裝平面",
          contentType: "application/zip",
          urlPath: `/file/presigned-url/installed-plane-upload/${projectId}`,
        },
        {
          onProgress: (progress) => {
            updateFileProgress("installedPlanePDF", "upload", progress, 0);
            callbacks?.onUploadProgress?.(progress);
          },
        }
      );

      if (!result) {
        const err = new Error(
          "Installed Plane PDF upload failed: No result from handleFileUpload."
        );
        updateFileProgress("installedPlanePDF", "error", 0, 0);
        callbacks?.onError?.(err);
        throw err;
      }

      updateFileProgress("installedPlanePDF", "complete", 100, 1);
      callbacks?.onSuccess?.(result);
      return result;
    } catch (error) {
      console.error("Installed Plane PDF upload error:", error);
      updateFileProgress("installedPlanePDF", "error", 0, 0);
      const catchedError =
        error instanceof Error ? error : new Error("Unknown upload error");
      callbacks?.onError?.(catchedError);
      throw catchedError; // Re-throw
    } finally {
      callbacks?.onComplete?.();
    }
  };

  return { uploadInstalledPlanePdf };
}
