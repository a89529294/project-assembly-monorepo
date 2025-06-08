import {
  ListObjectsV2Command,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { s3Client } from "../../s3";

interface PreparePresignedUploadParams {
  projectId: string;
  dirName: string;
  fileName: string;
  contentType: string;
  historyFileNameTemplate: (timestamp: string) => string;
}

export async function preparePresignedUpload({
  projectId,
  dirName,
  fileName,
  contentType,
  historyFileNameTemplate,
}: PreparePresignedUploadParams) {
  const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
  const dirPath = `projects/${projectId}/${dirName}/`;
  const historyDirPath = `${dirPath}歷史版本/`;
  const filePath = `${dirPath}${fileName}`;

  try {
    // 1. Check for existing file
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: filePath,
    });
    const listedObjects = await s3Client.send(listCommand);

    if (listedObjects.Contents && listedObjects.Contents.length > 0) {
      // 2. Ensure history dir exists
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: historyDirPath,
          Body: Buffer.from(""),
        })
      );
      // 3. Move to history
      const now = new Date().toISOString().replace(/[:T-]|\.\d{3}Z$/g, "");
      const historyFileName = historyFileNameTemplate(now);
      const historyFilePath = `${historyDirPath}${historyFileName}`;
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: BUCKET_NAME,
          CopySource: `${encodeURIComponent(BUCKET_NAME)}/${encodeURIComponent(filePath)}`,
          Key: historyFilePath,
        })
      );
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filePath,
        })
      );
    }

    // 4. Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return { uploadUrl, s3Key: filePath };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to prepare for file upload",
      cause: error instanceof Error ? error.message : "unknown error",
    });
  }
}
