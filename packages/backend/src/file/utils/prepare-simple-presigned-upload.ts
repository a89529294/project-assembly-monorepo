import {
  ListObjectsV2Command,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { s3Client } from "../../s3";

export async function prepareSimplePresignedUpload({
  filePath,
  contentType,
}: {
  filePath: string;
  contentType: string;
}) {
  const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL is valid for 1 hour
    });

    return { uploadUrl };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to generate temporary upload URL",
      cause: error instanceof Error ? error.message : "unknown error",
    });
  }
}
