import { useFileUpload } from "./use-file-upload";
import { useMultiFileUploadProgress } from "./use-multi-file-upload-progress";

export type DesignedPlanePdfUploadCallbacks = {
  onUploadProgress?: (progress: number) => void;
  onSuccess?: (result: {
    eTag: string;
    s3Key: string;
    fileSize: number;
  }) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
};

export type DesignedPlanePdfUploadParams = {
  projectId: string;
  designedPlanePDFFile: File;
};

export function useDesignedPlanePdfUpload() {
  const { handleFileUpload } = useFileUpload();
  const { updateFileProgress } = useMultiFileUploadProgress();

  const uploadDesignedPlanePdf = async (
    { projectId, designedPlanePDFFile }: DesignedPlanePdfUploadParams,
    callbacks?: DesignedPlanePdfUploadCallbacks
  ) => {
    updateFileProgress("designedPlanePDF", "upload", 0, 0);
    try {
      const result = await handleFileUpload(
        {
          file: designedPlanePDFFile,
          fileType: "designedPlanePDF", // Ensure this matches FileId
          contentType: "application/zip",
          urlPath: `/file/presigned-url/designed-plane-upload/${projectId}`,
        },
        {
          onProgress: (progress) => {
            updateFileProgress("designedPlanePDF", "upload", progress, 0);
            callbacks?.onUploadProgress?.(progress);
          },
        }
      );

      if (!result) {
        const err = new Error(
          "Designed Plane PDF upload failed: No result from handleFileUpload."
        );
        updateFileProgress("designedPlanePDF", "error", 0, 0);
        callbacks?.onError?.(err);
        throw err;
      }

      updateFileProgress("designedPlanePDF", "complete", 100, 1);
      callbacks?.onSuccess?.(result);
      return result;
    } catch (error) {
      console.error("Designed Plane PDF upload error:", error);
      updateFileProgress("designedPlanePDF", "error", 0, 0);
      const catchedError =
        error instanceof Error ? error : new Error("Unknown upload error");
      callbacks?.onError?.(catchedError);
      throw catchedError; // Re-throw
    } finally {
      callbacks?.onComplete?.();
    }
  };

  return { uploadDesignedPlanePdf };
}
