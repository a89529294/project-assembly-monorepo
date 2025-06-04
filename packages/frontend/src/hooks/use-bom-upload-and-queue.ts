import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "sonner";
import { privateFetch, uploadToS3 } from "@/lib/utils";
import { trpc } from "@/trpc";
import { queryClient } from "@/query-client";

export type BomUploadAndQueueParams = {
  projectId: string;
  bom: File | string | undefined;
};

export function useBomUploadAndQueue({
  customerId,
  projectState,
}: {
  customerId: string;
  projectState: "update" | "create";
}) {
  const { mutate: addBomToProcessQueue } = useMutation(
    trpc.basicInfo.onAddBomToProcessQueue.mutationOptions()
  );
  const [projectIdFromState, setProjectIdFromState] = useState<
    string | undefined
  >(undefined);
  const [state, setState] = useState<
    "uploading" | "processing" | "done" | "idle"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const { refetch: checkBomProcess, data: processProgress } = useQuery(
    trpc.basicInfo.checkBomProcessStatus.queryOptions(projectIdFromState!, {
      enabled: !!projectIdFromState,
    })
  );

  console.log(processProgress);

  const invalidateQueryAndNavigate = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.basicInfo.readCustomerProjects.queryKey(),
    });
    navigate({
      to: "/customers/summary/$customerId/projects",
      params: { customerId },
    });
    setState("done");
  };

  const handleBomUploadAndQueue = async ({
    projectId,
    bom,
  }: BomUploadAndQueueParams): Promise<void> => {
    setProjectIdFromState(projectId);
    setState("uploading");

    const waitForBomProcess = async (): Promise<void> => {
      const maxAttempts = 60; // 5 minutes

      try {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

          const { data: progress, isError } = await checkBomProcess();

          if (isError || progress?.status === "failed") {
            // Handle backend errors - this means the job failed or had issues
            throw new Error("匯入BOM表出錯");
          }

          if (progress?.progress === 100) {
            // Success! BOM import completed
            toast.success("BOM 匯入完成");
            invalidateQueryAndNavigate();
            return;
          }
        }

        // Timeout reached
        throw new Error("處理時間過長");
      } catch (error: unknown) {
        console.error("BOM import failed:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "BOM 匯入過程出錯，請稍後重新上傳BOM表"
        );
        invalidateQueryAndNavigate();
      }
    };

    // No BOM file or already uploaded
    if (typeof bom === "undefined" || typeof bom === "string") {
      toast.success(
        projectState === "create" ? "成功新增專案" : "成功更新專案"
      );
      invalidateQueryAndNavigate();
      return;
    }

    setState("uploading");
    setUploadProgress(0);

    try {
      // 1. Get presigned URL
      const { uploadUrl, s3Key } = await privateFetch(
        `/file/presigned-url/bom-upload/${projectId}`
      ).then((res) => res.json());

      // 2. Upload to S3
      const eTag = await uploadToS3(bom, uploadUrl, setUploadProgress);

      setState("processing");

      // 3. Add to process queue
      addBomToProcessQueue(
        {
          eTag,
          fileSize: bom.size,
          projectId,
          s3Key,
        },
        {
          onSuccess: (queueResult) => {
            if (queueResult.status === "waiting") {
              // TRUE SUCCESS - BOM processing starts
              toast.success("專案建立成功，BOM 處理開始");
              waitForBomProcess();
            } else if (queueResult.status === "skipped") {
              toast.error("無需處理 BOM");
              invalidateQueryAndNavigate();
            } else if (queueResult.status === "failed") {
              toast.error("無法將 BOM 加入處理佇列，請稍後再試");
              invalidateQueryAndNavigate();
            }
          },
          onError: (error) => {
            console.error("Failed to add BOM to queue:", error);
            toast.error("無法將 BOM 加入處理佇列，請稍後再試");
            invalidateQueryAndNavigate();
          },
        }
      );
    } catch (uploadError) {
      // S3 upload failed
      console.error("BOM upload failed:", uploadError);
      toast.error("BOM 上傳失敗，請稍後重新上傳");
      invalidateQueryAndNavigate();
    }
  };

  return {
    handleBomUploadAndQueue,
    uploadProgress,
    processProgress,
    state,
  };
}
