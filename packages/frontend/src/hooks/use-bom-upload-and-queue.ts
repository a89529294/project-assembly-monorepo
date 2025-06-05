import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "sonner";
import { trpc } from "@/trpc";
import { useFileUpload } from "./use-file-upload";

export type BomUploadAndQueueParams = {
  projectId: string;
  bom: File;
};

export type BomProcessCallbacks = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  onUploadProgress?: (progress: number) => void;
  onProcessProgress?: (progress: number) => void;
};

export function useBomUploadAndQueue() {
  const [projectIdFromState, setProjectIdFromState] = useState("");
  const { mutate: addBomToProcessQueue } = useMutation(
    trpc.basicInfo.onAddBomToProcessQueue.mutationOptions()
  );
  const { refetch: checkBomProcess } = useQuery(
    trpc.basicInfo.checkBomProcessStatus.queryOptions(projectIdFromState, {
      enabled: false,
    })
  );

  const { handleFileUpload } = useFileUpload();

  const handleBomUploadAndQueue = useCallback(
    async (
      { projectId, bom }: BomUploadAndQueueParams,
      callbacks?: BomProcessCallbacks
    ): Promise<void> => {
      // Set the project ID for status checking
      setProjectIdFromState(""); // Reset first
      setProjectIdFromState(projectId);

      try {
        // Use the generic file upload hook for the upload part
        const uploadResult = await handleFileUpload(
          {
            file: bom,
            fileType: "bom",
            contentType: "text/csv",
            urlPath: `/file/presigned-url/bom-upload/${projectId}`,
          },
          {
            onProgress: (progress: number) => {
              callbacks?.onUploadProgress?.(progress);
            },
            onError: (error: Error) => {
              callbacks?.onError?.(error);
              callbacks?.onComplete?.();
            },
          }
        );

        // If upload failed or was cancelled, exit early
        if (!uploadResult) {
          callbacks?.onError?.(new Error("Upload failed"));
          callbacks?.onComplete?.();
          return;
        }

        // Upload successful, start processing
        const { eTag, s3Key, fileSize } = uploadResult;

        // Add to process queue
        addBomToProcessQueue(
          {
            eTag,
            fileSize,
            projectId,
            s3Key,
          },
          {
            onSuccess: (queueResult) => {
              if (queueResult.status === "waiting") {
                // TRUE SUCCESS - BOM processing starts
                toast.success("專案建立成功，BOM 處理開始");

                // Start polling for process status
                const intervalId = setInterval(async () => {
                  try {
                    // Use TRPC query to check BOM process status
                    const { data: processData } = await checkBomProcess();

                    if (!processData) {
                      return; // Wait for data to be available
                    }

                    if (processData.status === "failed") {
                      clearInterval(intervalId);
                      callbacks?.onError?.(new Error("BOM processing failed"));
                      callbacks?.onComplete?.();
                      return;
                    }

                    // Update progress
                    const progress =
                      processData.status === "processing" ||
                      processData.status === "waiting" ||
                      processData.status === "done"
                        ? processData.progress
                        : 0;
                    callbacks?.onProcessProgress?.(progress);

                    if (processData.status === "done" && progress === 100) {
                      clearInterval(intervalId);
                      callbacks?.onSuccess?.();
                      callbacks?.onComplete?.();
                      // Clear project ID from state when done
                      setProjectIdFromState("");
                    }
                  } catch (error) {
                    clearInterval(intervalId);
                    callbacks?.onError?.(
                      error instanceof Error
                        ? error
                        : new Error("BOM processing failed")
                    );
                    callbacks?.onComplete?.();
                  }
                }, 2000);
              } else {
                callbacks?.onError?.(
                  new Error("Failed to queue BOM for processing")
                );
                callbacks?.onComplete?.();
              }
            },
            onError: (error) => {
              console.error("Failed to add BOM to queue:", error);
              toast.error("無法將 BOM 加入處理佇列，請稍後再試");
              callbacks?.onError?.(new Error("無法將 BOM 加入處理佇列"));
              callbacks?.onComplete?.();
            },
          }
        );
      } catch (error) {
        console.error("BOM upload and queue process failed:", error);
        const uploadError =
          error instanceof Error ? error : new Error("BOM 上傳處理失敗");
        callbacks?.onError?.(uploadError);
        callbacks?.onComplete?.();
      }
    },
    [
      handleFileUpload,
      addBomToProcessQueue,
      checkBomProcess,
      setProjectIdFromState,
    ]
  );

  return {
    handleBomUploadAndQueue,
  };
}
