import { useFileUpload } from "./use-file-upload";
import { useMultiFileUploadProgress } from "./use-multi-file-upload-progress";

export type ConstructorPdfUploadCallbacks = {
  onUploadProgress?: (progress: number) => void;
  onSuccess?: (result: {
    eTag: string;
    s3Key: string;
    fileSize: number;
  }) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
};

export type ConstructorPdfUploadParams = {
  projectId: string;
  constructorPDFFile: File;
};

export function useConstructorPdfUpload() {
  const { handleFileUpload } = useFileUpload();
  const { updateFileProgress } = useMultiFileUploadProgress();

  const uploadConstructorPdf = async (
    { projectId, constructorPDFFile }: ConstructorPdfUploadParams,
    callbacks?: ConstructorPdfUploadCallbacks
  ) => {
    updateFileProgress("constructorPDF", "upload", 0, 0);
    try {
      const result = await handleFileUpload(
        {
          file: constructorPDFFile,
          fileType: "構建PDF",
          contentType: "application/zip",
          urlPath: `/file/presigned-url/constructor-pdf-upload/${projectId}`,
        },
        {
          onProgress: (progress) => {
            updateFileProgress("constructorPDF", "upload", progress, 0);
            callbacks?.onUploadProgress?.(progress);
          },
        }
      );

      if (!result) {
        const err = new Error(
          "Constructor PDF upload failed: No result from handleFileUpload."
        );
        updateFileProgress("constructorPDF", "error", 0, 0);
        callbacks?.onError?.(err);
        throw err;
      }

      updateFileProgress("constructorPDF", "complete", 100, 1);
      callbacks?.onSuccess?.(result);
      return result;
    } catch (error) {
      console.error("Constructor PDF upload error:", error);
      updateFileProgress("constructorPDF", "error", 0, 0);
      const catchedError =
        error instanceof Error ? error : new Error("Unknown upload error");
      callbacks?.onError?.(catchedError);
      throw catchedError; // Re-throw
    } finally {
      callbacks?.onComplete?.();
    }
  };

  return { uploadConstructorPdf };
}
