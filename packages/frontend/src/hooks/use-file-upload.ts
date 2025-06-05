import { toast } from "sonner";
import { privateFetch, uploadToS3 } from "@/lib/utils";

export type FileUploadParams = {
  file: File;
  fileType: string; // e.g., "bom", "nc", etc.
  contentType: string;
  urlPath: string; // Full URL path for presigned URL request
  projectId?: string; // Optional project ID
};

export type FileUploadCallbacks = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
};

export function useFileUpload() {
  const handleFileUpload = async (
    { file, fileType, contentType, urlPath }: FileUploadParams,
    callbacks?: FileUploadCallbacks
  ): Promise<{ eTag: string; s3Key: string; fileSize: number } | null> => {
    try {
      // 1. Get presigned URL from the provided URL path
      const { uploadUrl, s3Key } = await privateFetch(urlPath).then((res) =>
        res.json()
      );

      // 2. Upload to S3
      const eTag = await uploadToS3(
        file,
        contentType,
        uploadUrl,
        (progress) => {
          callbacks?.onProgress?.(progress);
        }
      );

      toast.success(`${fileType.toUpperCase()} 上傳成功`);

      // Return the upload result for potential further processing
      const result = { eTag, s3Key, fileSize: file.size };

      callbacks?.onSuccess?.();
      return result;
    } catch (uploadError) {
      console.error(`${fileType} upload failed:`, uploadError);
      toast.error(`${fileType.toUpperCase()} 上傳失敗，請稍後重新上傳`);

      if (uploadError instanceof Error) {
        callbacks?.onError?.(uploadError);
      } else {
        callbacks?.onError?.(new Error(`${fileType} 上傳失敗`));
      }

      return null;
    } finally {
      callbacks?.onComplete?.();
    }
  };

  return {
    handleFileUpload,
  };
}
