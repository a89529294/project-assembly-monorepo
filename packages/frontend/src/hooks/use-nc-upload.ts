import { useCallback } from "react";
import { useFileUpload } from "./use-file-upload";

export type NcUploadParams = {
  projectId: string;
  nc: File;
};

export type NcUploadCallbacks = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  onUploadProgress?: (progress: number) => void;
};

export function useNcUpload() {
  const { handleFileUpload } = useFileUpload();

  const handleNcUpload = useCallback(
    async (
      { projectId, nc }: NcUploadParams,
      callbacks?: NcUploadCallbacks
    ): Promise<{ eTag: string; s3Key: string; fileSize: number } | null> => {
      try {
        // Use the generic file upload hook
        const result = await handleFileUpload(
          {
            file: nc,
            fileType: "nc",
            contentType: "application/zip",
            urlPath: `/file/presigned-url/nc-upload/${projectId}`,
          },
          {
            onProgress: (progress: number) => {
              callbacks?.onUploadProgress?.(progress);
            },
            onSuccess: () => {
              callbacks?.onSuccess?.();
            },
            onError: (error: Error) => {
              callbacks?.onError?.(error);
            },
            onComplete: () => {
              callbacks?.onComplete?.();
            },
          }
        );

        return result;
      } catch (error) {
        const uploadError =
          error instanceof Error ? error : new Error("NC 上傳失敗");
        callbacks?.onError?.(uploadError);
        callbacks?.onComplete?.();
        return null;
      }
    },
    [handleFileUpload]
  );

  return {
    handleNcUpload,
  };
}
